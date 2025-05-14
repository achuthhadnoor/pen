import React, { useRef, useEffect, useState } from 'react';

interface Point {
    x: number;
    y: number;
}

interface Shape {
    type: 'line' | 'rectangle' | 'circle' | 'pencil' | 'arrow' | 'move';
    points?: Point[];
    x1: number;
    y1: number;
    x2?: number;
    y2?: number;
    strokeColor?: string;
    strokeThickness?: number;
    fade?: boolean;
    opacity?: number;
    fill?: boolean;
    fillColor?: string;
    id: string;
}

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [startPoint, setStartPoint] = useState<Point | null>(null);
    const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
    const [tempShape, setTempShape] = useState<Shape | null>(null); // Shape being drawn
    const [history, setHistory] = useState<Shape[][]>([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [pencilPoints, setPencilPoints] = useState<Point[]>([]);
    const [offset, setOffset] = useState<Point | null>(null); // Offset of the cursor from the shape's origin

    const [drawing, setDrawing] = useState(false);
    const [shapeType, setShapeType] = useState<'line' | 'rectangle' | 'circle' | 'pencil' | 'arrow' | 'move'>('line');
    const [highlightCursor, setHighlightCursor] = useState(true);
    const [strokeThickness, setStrokeThickness] = useState<number>(2);
    const [fadeLines, setFadeLines] = useState(false);
    const [fadeSpeed, setFadeSpeed] = useState<number>(0.01);
    const [fillShape, setFillShape] = useState(false);
    const [movingShape, setMovingShape] = useState<string | null>(null); // ID of the shape being moved
    const [strokeColor, setStrokeColor] = useState<string>('rgb(100 255 127)');
    const [currentFillColor, setCurrentFillColor] = useState<string>('rgba(100, 255, 127, 0.1)');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const context = canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.lineCap = 'round';
        context.lineWidth = strokeThickness;

        // Redraw existing shapes
        shapes.forEach(shape => {
            drawShape(context, shape);
        });

        // Draw the temporary shape
        if (tempShape) {
            drawShape(context, tempShape);
        }

        if (highlightCursor) {
            drawCursorHighlight(context, cursorPosition);
        }


    }, [shapes, tempShape, cursorPosition, highlightCursor, strokeThickness, strokeColor]);

    useEffect(() => {
        if (fadeLines) {
            const fadeInterval = setInterval(() => {
                setShapes(prevShapes => {
                    return prevShapes.map(shape => {
                        if (shape.fade && shape.opacity && shape.opacity > 0) {
                            return { ...shape, opacity: shape.opacity - fadeSpeed };
                        }
                        return shape;
                    }).filter(shape => !(shape.fade && shape.opacity !== undefined && shape.opacity <= 0)); // Remove completely faded shapes
                });
            }, 20); // Adjust interval for fade speed
            return () => clearInterval(fadeInterval);
        }
    }, [fadeLines, fadeSpeed]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
                event.preventDefault();
                undo();
            } else if ((event.metaKey || event.ctrlKey) && event.key === 'y') {
                event.preventDefault();
                redo();
            } else if (event.key === 'l') {
                setShapeType('line');
            } else if (event.key === 'a') {
                setShapeType('arrow');
            } else if (event.key === 'r') {
                setShapeType('rectangle');
            } else if (event.key === 'c' || event.key === 'o') {
                setShapeType('circle');
            } else if (event.key === '1') {
                handleColorClick('100, 255, 127');
            } else if (event.key === '2') {
                handleColorClick('255, 252, 100');
            } else if (event.key === '3') {
                handleColorClick('255, 100, 164');
            } else if (event.key === 'f') {
                setFillShape(!fillShape);
            } else if (event.key === 'p') {
                setShapeType("pencil");
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [historyIndex, shapes, history, shapeType, strokeColor]);

    const drawCursorHighlight = (context: CanvasRenderingContext2D, position: { x: number, y: number }) => {
        context.beginPath();
        context.arc(position.x, position.y, 10, 0, 2 * Math.PI); // Adjust size as needed
        context.fillStyle = 'rgba(153, 44, 161, 0.683)'; // Semi-transparent black
        context.strokeStyle = 'rgba(153, 44, 161,1)';  // Color of the stroke
        context.stroke();  // Draw the stroke around the arc
        context.fill();
    };

    const drawShape = (context: CanvasRenderingContext2D, shape: Shape) => {
        context.strokeStyle = shape.strokeColor || 'rgba(0, 0, 0)'; // Semi-transparent black
        context.lineWidth = shape.strokeThickness || 2;
        if (shape.opacity !== undefined) {
            context.globalAlpha = shape.opacity;
        } else {
            context.globalAlpha = 1; // Default opacity
        }
        if (shape.fill) {
            context.fillStyle = shape.fillColor || 'rgba(0, 0, 0, 0.1)'; // Semi-transparent black
        }
        switch (shape.type) {
            case 'line': {
                context.beginPath();
                context.moveTo(shape.x1, shape.y1);
                context.lineTo(shape.x2!, shape.y2!);
                context.stroke();
                break;
            }
            case 'rectangle': {
                context.beginPath();
                context.rect(shape.x1, shape.y1, shape.x2! - shape.x1, shape.y2! - shape.y1);
                if (shape.fill) {
                    context.fillRect(shape.x1, shape.y1, shape.x2! - shape.x1, shape.y2! - shape.y1);
                }
                context.stroke();

                break;
            }
            case 'circle': {
                const radius = Math.sqrt(Math.pow(shape.x2! - shape.x1, 2) + Math.pow(shape.y2! - shape.y1, 2));
                context.beginPath();
                context.arc(shape.x1, shape.y1, radius, 0, 2 * Math.PI);
                if (shape.fill) {
                    context.fill();
                }
                context.stroke();
                break;
            }
            case 'pencil': {
                context.beginPath();
                if (shape.points && shape.points.length > 0) {
                    context.moveTo(shape.points[0].x, shape.points[0].y);
                    for (let i = 1; i < shape.points.length; i++) {
                        context.lineTo(shape.points[i].x, shape.points[i].y);
                    }
                    context.stroke();
                }
                break;
            }
            case 'arrow': {
                if (shape.x2 === undefined || shape.y2 === undefined) {
                    return;
                }

                const headLength = 20; // Length of the arrowhead
                const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);

                // Calculate arrowhead points
                const arrowX1 = shape.x2 - headLength * Math.cos(angle - Math.PI / 6);
                const arrowY1 = shape.y2 - headLength * Math.sin(angle - Math.PI / 6);
                const arrowX2 = shape.x2 - headLength * Math.cos(angle + Math.PI / 6);
                const arrowY2 = shape.y2 - headLength * Math.sin(angle + Math.PI / 6);

                // Draw the line
                context.beginPath();
                context.moveTo(shape.x1, shape.y1);
                context.lineTo(shape.x2, shape.y2);
                context.stroke();

                // Draw the arrowhead
                context.beginPath();
                context.moveTo(shape.x2, shape.y2);
                context.lineTo(arrowX1, arrowY1);
                context.moveTo(shape.x2, shape.y2);
                context.lineTo(arrowX2, arrowY2);
                context.stroke();
                break;
            }
            default:
                break;
        }
        context.globalAlpha = 1; // Reset opacity
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const { clientX, clientY } = 'touches' in event ? event.touches[0] : event;

        if (shapeType === 'move') {
            // Check if the click is inside any shape
            for (const shape of shapes) {
                const context = canvasRef.current!.getContext('2d')!;
                context.beginPath();

                switch (shape.type) {
                    case 'line': {
                        context.moveTo(shape.x1, shape.y1);
                        context.lineTo(shape.x2!, shape.y2!);
                        break;
                    }
                    case 'rectangle': {
                        context.rect(shape.x1, shape.y1, shape.x2! - shape.x1, shape.y2! - shape.y1);
                        break;
                    }
                    case 'circle': {
                        const radius = Math.sqrt(Math.pow(shape.x2! - shape.x1, 2) + Math.pow(shape.y2! - shape.y1, 2));
                        context.arc(shape.x1, shape.y1, radius, 0, 2 * Math.PI);
                        break;
                    }
                    case 'pencil': {
                        if (shape.points && shape.points.length > 0) {
                            context.moveTo(shape.points[0].x, shape.points[0].y);
                            for (let i = 1; i < shape.points.length; i++) {
                                context.lineTo(shape.points[i].x, shape.points[i].y);
                            }
                        }
                        break;
                    }
                    case 'arrow': {
                        const headLength = 20; // Length of the arrowhead
                        const angle = Math.atan2(shape.y2! - shape.y1, shape.x2! - shape.x1);
                        const arrowX1 = shape.x2! - headLength * Math.cos(angle - Math.PI / 6);
                        const arrowY1 = shape.y2! - headLength * Math.sin(angle - Math.PI / 6);
                        const arrowX2 = shape.x2! - headLength * Math.cos(angle + Math.PI / 6);
                        const arrowY2 = shape.y2! - headLength * Math.sin(angle + Math.PI / 6);
                        context.moveTo(shape.x1, shape.y1);
                        context.lineTo(shape.x2!, shape.y2!);
                        context.moveTo(shape.x2!, shape.y2!);
                        context.lineTo(arrowX1, arrowY1);
                        context.moveTo(shape.x2!, shape.y2!);
                        context.lineTo(arrowX2, arrowY2);
                        break;
                    }
                    default:
                        break;
                }

                if (context.isPointInPath(clientX, clientY)) {
                    setMovingShape(shape.id);
                    setOffset({ x: clientX - shape.x1, y: clientY - shape.y1 });
                    return;
                }
            }
            setMovingShape(null);
        } else {
            setDrawing(true);
            setStartPoint({ x: clientX, y: clientY });
            setCurrentPoint({ x: clientX, y: clientY });
            if (shapeType === 'pencil') {
                setPencilPoints([{ x: clientX, y: clientY }]);
            }
        }
    };

    const handleMouseUp = () => {
        setDrawing(false);
        if (movingShape) {
            setMovingShape(null);
            return;
        }

        if (!startPoint || !currentPoint) return;

        if (shapeType === 'pencil') {
            const newShape = {
                type: shapeType,
                x1: startPoint.x,
                y1: startPoint.y,
                points: pencilPoints,
                strokeColor: strokeColor,
                strokeThickness: strokeThickness,
                fade: fadeLines,
                opacity: 1,
                fill: false, // Pencil doesn't support fill
                id: Math.random().toString(),
            };
            setShapes(prevShapes => [...prevShapes, newShape]);

            // Update history
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push([...shapes, newShape]);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
            setPencilPoints([]);
            setTempShape(null);
            setStartPoint(null);
            setCurrentPoint(null);
        } else {


            const newShape = {
                type: shapeType,
                x1: startPoint.x,
                y1: startPoint.y,
                x2: currentPoint.x,
                y2: currentPoint.y,
                strokeColor: strokeColor,
                strokeThickness: strokeThickness,
                fade: fadeLines,
                opacity: 1,
                fill: fillShape,
                fillColor: fillShape ? currentFillColor : undefined,
                id: Math.random().toString(),
            };

            setShapes(prevShapes => [...prevShapes, newShape]);
            setTempShape(null);
            setStartPoint(null);
            setCurrentPoint(null);

            // Update history
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push([...shapes, newShape]);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const { clientX: currentClientX, clientY: currentClientY } = 'touches' in event ? event.touches[0] : event;
        setCursorPosition({ x: currentClientX, y: currentClientY });

        if (movingShape) {
            const shape = shapes.find(s => s.id === movingShape);
            if (shape && offset) {
                const newX = currentClientX - offset.x;
                const newY = currentClientY - offset.y;

                setShapes(prevShapes =>
                    prevShapes.map(s => {
                        if (s.id === movingShape) {
                            // Basic move, more complex logic might be needed for different shapes
                            return { ...s, x1: newX, y1: newY, x2: newX + (s.x2! - s.x1), y2: newY + (s.y2! - s.y1) };
                        }
                        return s;
                    })
                );
            }
            return;
        }
        if (!drawing || !startPoint) return;

        const { clientX: moveClientX, clientY: moveClientY } = 'touches' in event ? event.touches[0] : event;
        setCurrentPoint({ x: moveClientX, y: moveClientY });

        if (shapeType === 'pencil') {
            setPencilPoints(prevPoints => [...prevPoints, { x: moveClientX, y: moveClientY }]);
            setTempShape({
                type: shapeType,
                x1: startPoint.x,
                y1: startPoint.y,
                points: [...pencilPoints, { x: moveClientX, y: moveClientY }],
                strokeColor: strokeColor,
                strokeThickness: strokeThickness,
                fill: false, // Pencil doesn't support fill
                id: Math.random().toString(),
            });
        } else {

            const newShape = {
                type: shapeType,
                x1: startPoint.x,
                y1: startPoint.y,
                x2: moveClientX,
                y2: moveClientY,
                strokeColor: strokeColor,
                strokeThickness: strokeThickness,
                fill: fillShape,
                fillColor: fillShape ? currentFillColor : undefined,
                id: Math.random().toString(),
            };
            setTempShape(newShape);
        }
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setShapes(history[historyIndex - 1] || []);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setShapes(history[historyIndex + 1] || []);
        }
    };

    const clearCanvas = () => {
        setShapes([]);
        setTempShape(null);
        setStartPoint(null);
        setCurrentPoint(null);

        // Update history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([]);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleColorClick = (color: string) => {
        console.log(`rgba(${color})`);
        setStrokeColor(`rgba(${color})`);
        setCurrentFillColor(`rgba(${color},0.2)`);
    };

    return (
        <div className="relative h-screen w-screen"
            style={{ touchAction: 'none' }}
        >
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                onTouchMove={handleMouseMove}
            />
        </div>
    );
}
