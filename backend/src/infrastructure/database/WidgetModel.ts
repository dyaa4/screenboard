import { WidgetFactory } from "../../domain/widget/WidgetFactory";
import { IWidgetDocument } from "../../domain/types";
import { WidgetTypeEnum } from "../../domain/types/widget/WidgetTyp";
import { model, Schema } from "mongoose";

const widgetFactory = new WidgetFactory();

const WidgetSchema = new Schema({
  dashboardId: { type: String, ref: 'Dashboard', required: true },
  type: {
    type: String,
    enum: Object.values(WidgetTypeEnum),
    required: true,
  },
  title: { type: String, required: true },
  position: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  settings: {
    type: Schema.Types.Mixed,
    required: true,
  }
}, {
  timestamps: true,
});

async function validateSettingsUpdate(this: any, next: (err?: any) => void) {
  try {
    const update = this.getUpdate() as any;
    const newSettings = update?.settings || update?.$set?.settings;

    if (!newSettings) {
      return next();
    }

    // Altes Dokument holen
    const doc = await this.model.findOne(this.getQuery());
    if (!doc) {
      return next(new Error('Widget nicht gefunden'));
    }

    if (areSettingsEqual(doc.settings, newSettings)) {
      // Keine Änderung an settings -> OK
      return next();
    }

    // Widget-Instanz erzeugen
    const widget = widgetFactory.createWidget({
      dashboardId: doc.dashboardId,
      title: doc.title,
      position: doc.position,
      isActive: doc.isActive,
      type: doc.type,
      settings: newSettings,
    });

    // Default Settings prüfen
    const defaultSettings = widget.getDefaultSettings ? widget.getDefaultSettings() : undefined;
    if (!defaultSettings) {
      return next(new Error('Default settings are undefined'));
    }

    // Unerlaubte Properties prüfen
    const unallowedProps = findUnallowedProperties(newSettings, defaultSettings);
    if (unallowedProps.length > 0) {
      return next(new Error(`Unerlaubte Properties gefunden: ${unallowedProps.join(', ')}`));
    }

    // Settings validieren (optional)
    if (widget.validateSettings && !widget.validateSettings()) {
      return next(new Error('Settings-Validierung fehlgeschlagen'));
    }

    next();
  } catch (error) {
    next(error);
  }
}

function areSettingsEqual(oldSettings: object, newSettings: object): boolean {
  // Einfacher Deep-Equal Check per JSON (kann man ersetzen mit lodash/isEqual falls gewünscht)
  return JSON.stringify(oldSettings) === JSON.stringify(newSettings);
}

function findUnallowedProperties(newSettings: object, defaultSettings: object): string[] {
  const allowedProperties = Object.keys(defaultSettings);
  const actualProperties = Object.keys(newSettings);
  return actualProperties.filter(prop => !allowedProperties.includes(prop));
}

// Hook registrieren
WidgetSchema.pre('findOneAndUpdate', validateSettingsUpdate);

export const WidgetModel = model<IWidgetDocument>('Widget', WidgetSchema);
