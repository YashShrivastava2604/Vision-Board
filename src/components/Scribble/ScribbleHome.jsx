import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { GrSelect } from "react-icons/gr";
import { AiOutlineColumnWidth } from "react-icons/ai";
import rough from "roughjs/bundled/rough.esm";
import getStroke from "perfect-freehand";
import { NavbarContext } from "../../redux/NavbarContext";
import toast from "react-hot-toast";
import { RiRectangleLine } from "react-icons/ri";
import { FaPencilAlt } from "react-icons/fa";
import { FaEraser } from "react-icons/fa";
import { CiText } from "react-icons/ci";

const generator = rough.generator();

const createElement = (id, x1, y1, x2, y2, type, options = {}) => {
  switch (type) {
    case "line":
    case "rectangle":
      return { id, x1, y1, x2, y2, type, color: options.color, strokeSize: options.strokeSize };
    case "pencil":
      return { id, type, points: [{ x: x1, y: y1 }], color: options.color, strokeSize: options.strokeSize };
    case "text":
      return { id, type, x1, y1, x2, y2, text: "", color: options.color };
    default:
      throw new Error(`Type not recognised: ${type}`);
  }
};

const nearPoint = (x, y, x1, y1, name) =>
  Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;

const onLine = (x1, y1, x2, y2, x, y, maxDistance = 1) => {
  const a = { x: x1, y: y1 },
    b = { x: x2, y: y2 },
    c = { x, y };
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ? "inside" : null;
};

const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const distanceToSegment = (p, v, w) => {
  const l2 = distance(v, w) ** 2;
  if (l2 === 0) return distance(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projection = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
  return distance(p, projection);
};

const isTouchedByEraser = (element, x, y, radius) => {
  switch (element.type) {
    case "line":
      return (
        distanceToSegment(
          { x, y },
          { x: element.x1, y: element.y1 },
          { x: element.x2, y: element.y2 }
        ) <= radius
      );
    case "rectangle": {
      const x1 = Math.min(element.x1, element.x2);
      const x2 = Math.max(element.x1, element.x2);
      const y1 = Math.min(element.y1, element.y2);
      const y2 = Math.max(element.y1, element.y2);
      const topDist = distanceToSegment({ x, y }, { x: x1, y: y1 }, { x: x2, y: y1 });
      const rightDist = distanceToSegment({ x, y }, { x: x2, y: y1 }, { x: x2, y: y2 });
      const bottomDist = distanceToSegment({ x, y }, { x: x1, y: y2 }, { x: x2, y: y2 });
      const leftDist = distanceToSegment({ x, y }, { x: x1, y: y1 }, { x: x1, y: y2 });
      const minDist = Math.min(topDist, rightDist, bottomDist, leftDist);
      return minDist <= radius;
    }
    case "pencil": {
      for (let i = 0; i < element.points.length - 1; i++) {
        const p = element.points[i],
          q = element.points[i + 1];
        if (distanceToSegment({ x, y }, p, q) <= radius) {
          return true;
        }
      }
      return false;
    }
    case "text": {
      const x1 = Math.min(element.x1, element.x2);
      const x2 = Math.max(element.x1, element.x2);
      const y1 = Math.min(element.y1, element.y2);
      const y2 = Math.max(element.y1, element.y2);
      const topDist = distanceToSegment({ x, y }, { x: x1, y: y1 }, { x: x2, y: y1 });
      const rightDist = distanceToSegment({ x, y }, { x: x2, y: y1 }, { x: x2, y: y2 });
      const bottomDist = distanceToSegment({ x, y }, { x: x1, y: y2 }, { x: x2, y: y2 });
      const leftDist = distanceToSegment({ x, y }, { x: x1, y: y1 }, { x: x1, y: y2 });
      const minDist = Math.min(topDist, rightDist, bottomDist, leftDist);
      return minDist <= radius;
    }
    default:
      return false;
  }
};

const adjustElementCoordinates = (element) => {
  const { type, x1, y1, x2, y2 } = element;
  if (type === "rectangle") {
    const minX = Math.min(x1, x2),
      maxX = Math.max(x1, x2),
      minY = Math.min(y1, y2),
      maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    return x1 < x2 || (x1 === x2 && y1 < y2)
      ? { x1, y1, x2, y2 }
      : { x1: x2, y1: y2, x2: x1, y2: y1 };
  }
};

const positionWithinElement = (x, y, element) => {
  const threshold = 5;
  switch (element.type) {
    case "line": {
      const start = nearPoint(x, y, element.x1, element.y1, "start");
      const end = nearPoint(x, y, element.x2, element.y2, "end");
      const on = onLine(element.x1, element.y1, element.x2, element.y2, x, y, threshold);
      return start || end || on;
    }
    case "rectangle": {
      const { x1, y1, x2, y2 } = adjustElementCoordinates(element);
      const topLeft = nearPoint(x, y, x1, y1, "tl");
      const topRight = nearPoint(x, y, x2, y1, "tr");
      const bottomLeft = nearPoint(x, y, x1, y2, "bl");
      const bottomRight = nearPoint(x, y, x2, y2, "br");
      if (topLeft || topRight || bottomLeft || bottomRight) {
        return topLeft || topRight || bottomLeft || bottomRight;
      }
      const nearTop = Math.abs(y - y1) <= threshold;
      const nearBottom = Math.abs(y - y2) <= threshold;
      const nearLeft = Math.abs(x - x1) <= threshold;
      const nearRight = Math.abs(x - x2) <= threshold;
      return (nearTop || nearBottom || nearLeft || nearRight) &&
        x >= x1 &&
        x <= x2 &&
        y >= y1 &&
        y <= y2
        ? "inside"
        : null;
    }
    case "pencil": {
      const betweenAnyPoint = element.points.some((point, index) => {
        const nextPoint = element.points[index + 1];
        if (!nextPoint) return false;
        return onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, threshold) != null;
      });
      return betweenAnyPoint ? "edge" : null;
    }
    case "text": {
      const { x1, y1, x2, y2 } = adjustElementCoordinates(element);
      const topLeft = nearPoint(x, y, x1, y1, "tl");
      const topRight = nearPoint(x, y, x2, y1, "tr");
      const bottomLeft = nearPoint(x, y, x1, y2, "bl");
      const bottomRight = nearPoint(x, y, x2, y2, "br");
      if (topLeft || topRight || bottomLeft || bottomRight) {
        return topLeft || topRight || bottomLeft || bottomRight;
      }
      const nearTop = Math.abs(y - y1) <= threshold;
      const nearBottom = Math.abs(y - y2) <= threshold;
      const nearLeft = Math.abs(x - x1) <= threshold;
      const nearRight = Math.abs(x - x2) <= threshold;
      return (nearTop || nearBottom || nearLeft || nearRight) &&
        x >= x1 &&
        x <= x2 &&
        y >= y1 &&
        y <= y2
        ? "inside"
        : null;
    }
    default:
      throw new Error(`Type not recognised: ${element.type}`);
  }
};

const cursorForPosition = (position) => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    default:
      return "move";
  }
};

const resizedCoordinates = (clientX, clientY, position, coordinates) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case "tl":
    case "start":
      return { x1: clientX, y1: clientY, x2, y2 };
    case "tr":
      return { x1, y1: clientY, x2: clientX, y2 };
    case "bl":
      return { x1: clientX, y1, x2, y2: clientY };
    case "br":
    case "end":
      return { x1, y1, x2: clientX, y2: clientY };
    default:
      return null;
  }
};

const useHistory = (initialState) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = (action, overwrite = false) => {
    const newState =
      typeof action === "function" ? action(history[index]) : action;
    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex((prevState) => prevState + 1);
    }
  };

  const undo = () => index > 0 && setIndex((prevState) => prevState - 1);
  const redo = () =>
    index < history.length - 1 && setIndex((prevState) => prevState + 1);

  return [history[index], setState, undo, redo];
};

const getSvgPathFromStroke = (stroke) => {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );
  d.push("Z");
  return d.join(" ");
};

const drawElement = (roughCanvas, context, element, scale, currentColor) => {
  switch (element.type) {
    case "line": {
      const color = element.color || currentColor;
      const roughOptions = { strokeWidth: 1 / scale, stroke: color };
      const newElement = generator.line(
        element.x1,
        element.y1,
        element.x2,
        element.y2,
        roughOptions
      );
      roughCanvas.draw(newElement);
      break;
    }
    case "rectangle": {
      const color = element.color || currentColor;
      const roughOptions = { strokeWidth: 1 / scale, stroke: color };
      const newElement = generator.rectangle(
        element.x1,
        element.y1,
        element.x2 - element.x1,
        element.y2 - element.y1,
        roughOptions
      );
      roughCanvas.draw(newElement);
      break;
    }
    case "pencil": {
      const color = element.color || currentColor;
      const baseSize = element.strokeSize || 3;
      const strokePoints = getStroke(element.points, {
        size: baseSize / scale,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      });
      const strokePath = getSvgPathFromStroke(strokePoints);
      context.fillStyle = color;
      context.fill(new Path2D(strokePath));
      break;
    }
    case "text":
      context.textBaseline = "top";
      context.fillStyle = element.color || currentColor;
      context.font = "21px sans-serif";
      context.fillText(element.text, element.x1, element.y1);
      break;
    default:
      throw new Error(`Type not recognised: ${element.type}`);
  }
};

const adjustmentRequired = (type) => ["line", "rectangle"].includes(type);

const usePressedKeys = () => {
  const [pressedKeys, setPressedKeys] = useState(new Set());
  useEffect(() => {
    const handleKeyDown = (event) => {
      setPressedKeys((prevKeys) => new Set(prevKeys).add(event.key));
    };
    const handleKeyUp = (event) => {
      setPressedKeys((prevKeys) => {
        const updatedKeys = new Set(prevKeys);
        updatedKeys.delete(event.key);
        return updatedKeys;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  return pressedKeys;
};

const useNavbarWidth = (collapsed) => (collapsed ? 56 : 224);

const ScribbleHome = () => {
  const { collapsed } = useContext(NavbarContext);
  const navbarWidth = useNavbarWidth(collapsed);
  const containerRef = useRef(null);
  const storedDrawing = localStorage.getItem("savedDrawing");
  const initialElements =
    storedDrawing && storedDrawing !== "undefined"
      ? JSON.parse(storedDrawing)
      : [];
  const [elements, setElements, undo, redo] = useHistory(initialElements);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("rectangle");
  const [selectedElement, setSelectedElement] = useState(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [startPanMousePosition, setStartPanMousePosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [scaleOffset, setScaleOffset] = useState({ x: 0, y: 0 });
  const [eraserPosition, setEraserPosition] = useState(null);
  const eraserRadius = 10;
  const textAreaRef = useRef();
  const pressedKeys = usePressedKeys();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth - navbarWidth,
    height: window.innerHeight,
  });

  
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverX, setPopoverX] = useState(0);
  const [popoverY, setPopoverY] = useState(0);
  const [showStrokeOptions, setShowStrokeOptions] = useState(false);
  const [currentColor, setCurrentColor] = useState("black");
  const [currentStrokeSize, setCurrentStrokeSize] = useState(3);

  useEffect(() => {
    localStorage.setItem("savedDrawing", JSON.stringify(elements || []));
  }, [elements]);

  const handleSave = () => {
    localStorage.setItem("savedDrawing", JSON.stringify(elements));
    toast.success("Canvas saved!");
  };

  const handleClear = () => {
    localStorage.removeItem("savedDrawing");
    setElements([]);
    toast.error("Canvas cleared!");
  };

  const eraseElementsAtPosition = (x, y) => {
    setElements(
      (prev) => (prev || []).filter((element) => !isTouchedByEraser(element, x, y, eraserRadius)),
      true
    );
  };

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navbarWidth]);

  useLayoutEffect(() => {
    const canvasEl = document.getElementById("canvas");
    const context = canvasEl.getContext("2d");
    const roughCanvas = rough.canvas(canvasEl);
    context.clearRect(0, 0, canvasEl.width, canvasEl.height);
    const scaleWidth = canvasEl.width * scale;
    const scaleHeight = canvasEl.height * scale;
    const scaleOffsetX = (scaleWidth - canvasEl.width) / 2;
    const scaleOffsetY = (scaleHeight - canvasEl.height) / 2;
    setScaleOffset({ x: scaleOffsetX, y: scaleOffsetY });
    context.save();
    context.translate(
      panOffset.x * scale - scaleOffsetX,
      panOffset.y * scale - scaleOffsetY
    );
    context.scale(scale, scale);
    context.lineWidth = 1 / scale;
    if (elements) {
      elements.forEach((element) => {
        if (action === "writing" && selectedElement?.id === element.id) return;
        drawElement(roughCanvas, context, element, scale, currentColor);
      });
    }
    context.restore();
    if (tool === "eraser" && eraserPosition) {
      context.save();
      context.translate(
        panOffset.x * scale - scaleOffsetX,
        panOffset.y * scale - scaleOffsetY
      );
      context.scale(scale, scale);
      context.beginPath();
      context.arc(eraserPosition.x, eraserPosition.y, eraserRadius, 0, 2 * Math.PI);
      context.fillStyle = "rgba(0,0,0,0.2)";
      context.fill();
      context.restore();
    }
  }, [elements, action, selectedElement, panOffset, tool, eraserPosition, scale, currentColor]);

  useEffect(() => {
    const undoRedoFunction = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener("keydown", undoRedoFunction);
    return () => window.removeEventListener("keydown", undoRedoFunction);
  }, [undo, redo]);

  useEffect(() => {
    const panFunction = (event) => {
      event.preventDefault();
      if (pressedKeys.has("Meta") || pressedKeys.has("Control"))
        onZoom(event.deltaY * -0.01);
      else
        setPanOffset((prevState) => ({
          x: prevState.x - event.deltaX,
          y: prevState.y - event.deltaY,
        }));
    };
    window.addEventListener("wheel", panFunction, { passive: false });
    return () => window.removeEventListener("wheel", panFunction);
  }, [pressedKeys]);

  useEffect(() => {
    if (action === "writing") {
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          textAreaRef.current.value = selectedElement.text;
        }
      }, 0);
    }
  }, [action, selectedElement]);

  const handleCanvasClick = () => {
    if (popoverVisible) {
      setPopoverVisible(false);
    }
  };

  
  const handleToolClick = (newTool, event) => {
    setTool(newTool);
    if (newTool !== "eraser" && newTool !== "selection") {
      setPopoverX(window.innerWidth - 200);
      setPopoverY(100);
      setPopoverVisible(true);
      setShowStrokeOptions(newTool === "pencil");
    } else {
      setPopoverVisible(false);
    }
  };

  const updateElement = (id, x1, y1, x2, y2, type, options = {}) => {
    const elementsCopy = [...elements];
    switch (type) {
      case "line":
      case "rectangle":
        elementsCopy[id] = createElement(id, x1, y1, x2, y2, type, { color: currentColor, strokeSize: currentStrokeSize });
        break;
      case "pencil":
        elementsCopy[id].points = [...elementsCopy[id].points, { x: x2, y: y2 }];
        break;
      case "text": {
        const textWidth = document.getElementById("canvas").getContext("2d").measureText(options.text).width;
        const textHeight = 24;
        elementsCopy[id] = {
          ...createElement(id, x1, y1, x1 + textWidth, y1 + textHeight, type, { color: currentColor }),
          text: options.text,
        };
        break;
      }
      default:
        throw new Error(`Type not recognised: ${type}`);
    }
    setElements(elementsCopy, true);
  };

  function getMouseCoordinates(event) {
    const canvasEl = document.getElementById("canvas");
    const rect = canvasEl.getBoundingClientRect();
    return {
      clientX: (event.clientX - rect.left - panOffset.x * scale + scaleOffset.x) / scale,
      clientY: (event.clientY - rect.top - panOffset.y * scale + scaleOffset.y) / scale,
    };
  }

  const handleMouseDown = (event) => {
    if (popoverVisible) setPopoverVisible(false);
    if (action === "writing") return;
    const { clientX, clientY } = getMouseCoordinates(event);
    console.log("Canvas Mouse Down:", clientX, clientY);
    if (event.button === 1 || pressedKeys.has(" ")) {
      setAction("panning");
      setStartPanMousePosition({ x: clientX, y: clientY });
      return;
    }
    if (tool === "eraser") {
      setAction("erasing");
      setEraserPosition({ x: clientX, y: clientY });
      eraseElementsAtPosition(clientX, clientY);
      return;
    }
    if (elements) {
      if (tool === "selection") {
        const element = elements
          .map((element) => ({
            ...element,
            position: positionWithinElement(clientX, clientY, element),
          }))
          .find((element) => element.position !== null);
        if (element) {
          if (element.type === "pencil") {
            const xOffsets = element.points.map((point) => clientX - point.x);
            const yOffsets = element.points.map((point) => clientY - point.y);
            setSelectedElement({ ...element, xOffsets, yOffsets });
            setAction("moving");
          } else if (element.type === "line") {
            const centerX = (element.x1 + element.x2) / 2;
            const centerY = (element.y1 + element.y2) / 2;
            const offsetX = clientX - centerX;
            const offsetY = clientY - centerY;
            setSelectedElement({ ...element, offsetX, offsetY });
            setAction(element.position === "inside" ? "moving" : "resizing");
          } else {
            const offsetX = clientX - element.x1;
            const offsetY = clientY - element.y1;
            setSelectedElement({ ...element, offsetX, offsetY });
            setAction(element.position === "inside" ? "moving" : "resizing");
          }
          setElements((prevState) => prevState);
        }
      } else {
        const id = elements.length;
        const element = createElement(id, clientX, clientY, clientX, clientY, tool, { color: currentColor, strokeSize: currentStrokeSize });
        setElements((prevState) => [...prevState, element]);
        setSelectedElement(element);
        setAction(tool === "text" ? "writing" : "drawing");
      }
    }
  };

  const handleMouseMove = (event) => {
    const { clientX, clientY } = getMouseCoordinates(event);
    if (tool === "eraser" && action === "erasing") {
      setEraserPosition({ x: clientX, y: clientY });
      eraseElementsAtPosition(clientX, clientY);
      return;
    }
    if (action === "panning") {
      const deltaX = clientX - startPanMousePosition.x;
      const deltaY = clientY - startPanMousePosition.y;
      setPanOffset({ x: panOffset.x + deltaX, y: panOffset.y + deltaY });
      return;
    }
    if (tool === "selection") {
      const element = elements
        .map((element) => ({
          ...element,
          position: positionWithinElement(clientX, clientY, element),
        }))
        .find((element) => element.position !== null);
      event.target.style.cursor = element ? cursorForPosition(element.position) : "default";
    }
    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);
    } else if (action === "moving") {
      if (selectedElement.type === "pencil") {
        const newPoints = selectedElement.points.map((_, index) => ({
          x: clientX - selectedElement.xOffsets[index],
          y: clientY - selectedElement.yOffsets[index],
        }));
        const elementsCopy = [...elements];
        elementsCopy[selectedElement.id] = { ...elementsCopy[selectedElement.id], points: newPoints };
        setElements(elementsCopy, true);
      } else if (selectedElement.type === "line") {
        const currentCenterX = (selectedElement.x1 + selectedElement.x2) / 2;
        const currentCenterY = (selectedElement.y1 + selectedElement.y2) / 2;
        const dx = clientX - selectedElement.offsetX - currentCenterX;
        const dy = clientY - selectedElement.offsetY - currentCenterY;
        const newX1 = selectedElement.x1 + dx;
        const newY1 = selectedElement.y1 + dy;
        const newX2 = selectedElement.x2 + dx;
        const newY2 = selectedElement.y2 + dy;
        updateElement(selectedElement.id, newX1, newY1, newX2, newY2, "line");
      } else {
        const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
        const newX1 = clientX - offsetX;
        const newY1 = clientY - offsetY;
        const options = type === "text" ? { text: selectedElement.text } : {};
        updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type, options);
      }
    } else if (action === "resizing") {
      const { id, type, position, ...coordinates } = selectedElement;
      const newCoords = resizedCoordinates(clientX, clientY, position, coordinates);
      if (!newCoords) return;
      const { x1, y1, x2, y2 } = newCoords;
      updateElement(id, x1, y1, x2, y2, type);
    }
  };

  const handleMouseUp = (event) => {
    const { clientX, clientY } = getMouseCoordinates(event);
    if (selectedElement) {
      if (
        selectedElement.type === "text" &&
        clientX - selectedElement.offsetX === selectedElement.x1 &&
        clientY - selectedElement.offsetY === selectedElement.y1
      ) {
        setAction("writing");
        return;
      }
      const index = selectedElement.id;
      const { id, type } = elements[index];
      if ((action === "drawing" || action === "resizing") && adjustmentRequired(type)) {
        const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type);
      }
    }
    if (action === "erasing") {
      setAction("none");
      setEraserPosition(null);
    } else if (action !== "writing") {
      setAction("none");
      setSelectedElement(null);
    }
  };

  const handleBlur = (event) => {
    const { id, x1, y1, type } = selectedElement;
    setAction("none");
    setSelectedElement(null);
    updateElement(id, x1, y1, null, null, type, { text: event.target.value });
  };

  const onZoom = (delta) => {
    setScale((prev) => Math.min(Math.max(prev + delta, 0.1), 20));
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Toolbar */}
      <div
        style={{
          position: "fixed",
          zIndex: 1001,
          top: "6rem",
          right: 0,
        }}
        className="flex flex-col border bg-gray-100"
      >
        <button className={`p-4 ${tool === "selection" ? "bg-gray-900 text-white" : "bg-white text-black"}`} id="selection" onClick={() => setTool("selection")}>
          <GrSelect />
        </button>
        <button className={`p-4 ${tool === "line" ? "bg-gray-900 text-white" : "bg-white text-black"}`} id="line" onClick={(e) => handleToolClick("line", e)}>
          <AiOutlineColumnWidth />
        </button>
        <button className={`p-4 ${tool === "rectangle" ? "bg-gray-900 text-white" : "bg-white text-black"}`} id="rectangle" onClick={(e) => handleToolClick("rectangle", e)}>
          <RiRectangleLine />
        </button>
        <button className={`p-4 ${tool === "pencil" ? "bg-gray-900 text-white" : "bg-white text-black"}`} id="pencil" onClick={(e) => handleToolClick("pencil", e)}>
          <FaPencilAlt />
        </button>
        <button className={`p-4 ${tool === "text" ? "bg-gray-900 text-white" : "bg-white text-black"}`} id="text" onClick={(e) => handleToolClick("text", e)}>
          <CiText />
        </button>
        <button className={`p-4 ${tool === "eraser" ? "bg-gray-900 text-white" : "bg-white text-black"}`} id="eraser" onClick={() => { setTool("eraser"); setPopoverVisible(false); }}>
          <FaEraser />
        </button>
      </div>

      {/* Popover Menu via Portal */}
      {popoverVisible &&
        ReactDOM.createPortal(
          <div
            id="popover"
            style={{
              position: "fixed",
              left: window.innerWidth - 200,
              top: 100,
              background: "white",
              border: "1px solid #ccc",
              padding: "10px",
              zIndex: 2000,
              width: "150px",
            }}
          >
            {showStrokeOptions && (
              <div id="stroke-options" style={{ marginBottom: "8px", display: "flex", flexDirection: "column" }}>
                <div className="stroke-option" onClick={() => { setCurrentStrokeSize(2); setPopoverVisible(false); }} style={{ cursor: "pointer", padding: "5px", border: "1px solid #ddd", marginBottom: "4px" }}>
                  Thin
                </div>
                <div className="stroke-option" onClick={() => { setCurrentStrokeSize(5); setPopoverVisible(false); }} style={{ cursor: "pointer", padding: "5px", border: "1px solid #ddd", marginBottom: "4px" }}>
                  Medium
                </div>
                <div className="stroke-option" onClick={() => { setCurrentStrokeSize(8); setPopoverVisible(false); }} style={{ cursor: "pointer", padding: "5px", border: "1px solid #ddd" }}>
                  Thick
                </div>
              </div>
            )}
            <div id="color-options" style={{ display: "flex", gap: "5px" }}>
              {["black", "red", "blue", "green"].map((col) => (
                <div key={col} className="color-option" style={{ background: col, width: "20px", height: "20px", borderRadius: "50%", cursor: "pointer" }} onClick={() => { setCurrentColor(col); setPopoverVisible(false); }}></div>
              ))}
            </div>
          </div>,
          document.body
        )}

      {/* Canvas container */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        style={{
          position: "absolute",
          top: 0,
          left: navbarWidth,
          width: `calc(100vw - ${navbarWidth}px)`,
          height: "100vh",
          boxSizing: "border-box",
          zIndex: 1000,
          pointerEvents: "auto",
        }}
      >
        <canvas
          id="canvas"
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px`, pointerEvents: "auto" }}
        >
          Canvas
        </canvas>
      </div>

      {/* Save, Clear, Undo/Redo, Zoom controls */}
      <div
        className="fixed p-1 flex items-center gap-5 justify-around"
        style={{ zIndex: 2000, bottom: 0, right: "40px" }}
      >
        <button className="border bg-gray-900 text-white rounded cursor-pointer p-2" onClick={handleSave}>
          Save Drawing
        </button>
        <div className="flex gap-[1rem] items-center justify-center">
          <button className="border bg-gray-900 text-white rounded cursor-pointer p-2" onClick={undo}>
            Undo
          </button>
          <button className="bg-gray-900 text-white rounded border cursor-pointer p-2" onClick={redo}>
            Redo
          </button>
        </div>
        <button className="bg-gray-900 text-white rounded border cursor-pointer p-2" onClick={handleClear}>
          Clear Drawing
        </button>
        <div className="flex px-5 w-[5rem] justify-between gap-4 items-center">
          <button className="cursor-pointer text-2xl" onClick={() => onZoom(-0.1)}>
            -
          </button>
          <span onClick={() => setScale(1)}>
            {new Intl.NumberFormat("en-GB", { style: "percent" }).format(scale)}
          </span>
          <button className="cursor-pointer text-2xl" onClick={() => onZoom(0.1)}>
            +
          </button>
        </div>
      </div>

      <div className="right-0 fixed z-100000 text-gray-500 tracking-wider">
        <p>Use space and drag to move around</p>
        <p>Use ctrl to zoom in and zoom out</p>
      </div>

      {/* Textarea for text editing */}
      {action === "writing" && selectedElement && (
        <textarea
          ref={textAreaRef}
          onBlur={handleBlur}
          style={{
            position: "fixed",
            top: selectedElement.y1 * scale + panOffset.y * scale - scaleOffset.y,
            left: selectedElement.x1 * scale + panOffset.x * scale - scaleOffset.x + navbarWidth,
            font: `${24 * scale} sans-serif`,
            background: "transparent",
            border: "1px dashed #888",
            outline: "none",
            zIndex: 100,
            resize: "none",
            color: "black",
          }}
        />
      )}
    </div>
  );
};

export default ScribbleHome;
