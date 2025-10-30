// Hilfsfunktionen

import { IWidgetDocument } from "../../../../domain/types";



/**
 * Aktualisiert die Positionen der Widgets nach dem Verschieben eines Widgets
 * @param widgets die aktuelle Liste von Widgets
 * @param newWidget das verschobene Widget
 * @param oldPosition die alte Position des verschobenen Widgets
 * @returns
 */
export function updateWidgetPositions(
  widgets: IWidgetDocument[],
  idUpdatedWidget: string,
  newPosition: number,
  oldPosition: number,
): IWidgetDocument[] {
  const isMovingDown = newPosition > oldPosition;

  return widgets.map((widget) => {
    if (widget._id.toString() === idUpdatedWidget) return widget; // Skip the widget being updated

    if (isMovingDown) {
      if (widget.position > oldPosition && widget.position <= newPosition) {
        widget.position -= 1;
      }
    } else {
      if (widget.position >= newPosition && widget.position < oldPosition) {
        widget.position += 1;
      }
    }
    return widget;
  });
}
