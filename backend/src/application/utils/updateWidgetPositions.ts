import { IWidgetDocument } from "../../domain/types";

/**
 * Verschiebt Widgets so, dass die neue Position des Widgets reserviert ist.
 * Beispiel: 
 * - widgets: Liste aller Widgets mit aktueller Position
 * - movingWidgetId: ID des Widgets, das verschoben wird
 * - newPosition: neue Position, die das Widget einnehmen soll
 * - oldPosition: alte Position des Widgets
 */
export function updateWidgetPositions(
    widgets: IWidgetDocument[],
    movingWidgetId: string,
    newPosition: number,
    oldPosition: number
): IWidgetDocument[] {
    // Widget bewegt sich nach unten
    if (newPosition > oldPosition) {
        widgets.forEach(w => {
            if (
                w._id.toString() !== movingWidgetId &&
                w.position > oldPosition &&
                w.position <= newPosition
            ) {
                w.position -= 1;
            }
        });
    }

    // Widget bewegt sich nach oben
    else if (newPosition < oldPosition) {
        widgets.forEach(w => {
            if (
                w._id.toString() !== movingWidgetId &&
                w.position >= newPosition &&
                w.position < oldPosition
            ) {
                w.position += 1;
            }
        });
    }

    // Neue Position für das verschobene Widget setzen
    const movingWidget = widgets.find(w => w._id.toString() === movingWidgetId);
    if (movingWidget) {
        movingWidget.position = newPosition;
    }

    return widgets;
}
