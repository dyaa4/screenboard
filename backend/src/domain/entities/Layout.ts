import { BaseEntity } from "../../domain/entities/BaseEntity";
import { FontSize } from "../../domain/types/layout/FontSize";
import { Rotation } from "../../domain/types/layout/Rotation";

export class Layout extends BaseEntity {
  dashboardId: string;
  pinProtectionEnabled: boolean;
  pinCode?: string;
  fontSize: FontSize;
  rotation: Rotation;
  backgroundBrightness: number;
  backgroundImages: string[];
  backgroundAnimationEnabled: boolean;
  backgroundBlurEnabled: boolean;
  customColor?: string;

  constructor(
    dashboardId: string,
    pinProtectionEnabled: boolean,
    fontSize: FontSize,
    rotation: Rotation,
    backgroundBrightness: number,
    backgroundImages: string[] = [],
    backgroundAnimationEnabled: boolean = false,
    backgroundBlurEnabled: boolean = false,
    customColor?: string,
    pinCode?: string
  ) {
    super();
    this.dashboardId = dashboardId;
    this.pinProtectionEnabled = pinProtectionEnabled;
    this.pinCode = pinCode;
    this.fontSize = fontSize;
    this.rotation = rotation;
    this.backgroundBrightness = backgroundBrightness;
    this.backgroundImages = backgroundImages;
    this.backgroundAnimationEnabled = backgroundAnimationEnabled;
    this.backgroundBlurEnabled = backgroundBlurEnabled;
    this.customColor = customColor;
  }
}