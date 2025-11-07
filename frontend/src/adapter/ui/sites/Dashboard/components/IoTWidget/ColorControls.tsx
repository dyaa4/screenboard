import { useState, useCallback } from 'react';
import { Card, Slider, Button } from '@heroui/react';
import { IoTDevice } from '../../../../../../domain/types';
import { Layout } from '../../../../../../domain/entities/Layout';
import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import { getFontSizeClass } from '@sites/Dashboard/helper';
import { useTheme } from 'next-themes';
import { t } from '@adapter/ui/i18n/i18n';

interface ColorControlsProps {
    device: IoTDevice;
    layout: Layout | undefined;
    onColorChange: (deviceId: string, hue: number, saturation: number) => void;
    onColorTemperatureChange: (deviceId: string, colorTemperature: number) => void;
    onBrightnessChange: (deviceId: string, level: number) => void;
    isLoading?: boolean;
    hasError?: boolean;
}

export default function ColorControls({
    device,
    layout,
    onColorChange,
    onColorTemperatureChange,
    onBrightnessChange,
    isLoading = false,
    hasError = false,
}: ColorControlsProps) {
    const { theme } = useTheme();

    // Local state for live preview during dragging
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(100);
    const [colorTemperature, setColorTemperature] = useState(3000);
    const [brightness, setBrightness] = useState(100);

    const [isExpanded, setIsExpanded] = useState(false);

    // Convert HSB to HSL for CSS display
    const getPreviewColor = useCallback(() => {
        // Convert hue from 0-100 to 0-360
        const h = (hue * 360) / 100;
        // Convert saturation from 0-100 to 0-100 (already correct range)
        const s = saturation;
        // Use 50% lightness for good color visibility
        const l = 50;

        return `hsl(${h}, ${s}%, ${l}%)`;
    }, [hue, saturation]);

    // Convert color temperature to HSL approximation
    const getColorTemperaturePreview = useCallback(() => {
        // Simple color temperature to RGB approximation
        let r, g, b;

        const temp = colorTemperature / 100;

        if (temp <= 66) {
            r = 255;
            g = Math.max(0, Math.min(255, 99.4708025861 * Math.log(temp) - 161.1195681661));
        } else {
            r = Math.max(0, Math.min(255, 329.698727446 * Math.pow(temp - 60, -0.1332047592)));
            g = Math.max(0, Math.min(255, 288.1221695283 * Math.pow(temp - 60, -0.0755148492)));
        }

        if (temp >= 66) {
            b = 255;
        } else if (temp <= 19) {
            b = 0;
        } else {
            b = Math.max(0, Math.min(255, 138.5177312231 * Math.log(temp - 10) - 305.0447927307));
        }

        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }, [colorTemperature]);

    const handleColorChange = (newHue: number, newSaturation: number) => {
        setHue(newHue);
        setSaturation(newSaturation);
        onColorChange(device.deviceId, newHue, newSaturation);
    };

    const handleColorTemperatureChange = (newTemp: number) => {
        setColorTemperature(newTemp);
        onColorTemperatureChange(device.deviceId, newTemp);
    };

    const handleBrightnessChange = (newLevel: number) => {
        setBrightness(newLevel);
        onBrightnessChange(device.deviceId, newLevel);
    };

    if (!device.supportsColor && !device.supportsColorTemperature && !device.supportsBrightness) {
        return <></>;
    }

    return (
        <Card
            className="p-3 mt-2 transition-all duration-300"
            style={getCustomColorCssClass(layout, theme)}
        >
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className={`${getFontSizeClass(layout?.fontSize)} font-medium`}>
                        <i className="fa-solid fa-palette mr-2"></i>
                        {t('sites.dashboard.components.iot.color_controls')}
                    </h4>
                    <Button
                        size="sm"
                        variant="ghost"
                        isIconOnly
                        onPress={() => setIsExpanded(!isExpanded)}
                        isDisabled={isLoading || hasError}
                    >
                        <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                    </Button>
                </div>

                {isExpanded && (
                    <div className="space-y-4 animate-in slide-in-from-top duration-200">

                        {/* Color Control (HSB) */}
                        {device.supportsColor && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className={`${getFontSizeClass(layout?.fontSize)} font-medium`}>
                                        <i className="fa-solid fa-droplet mr-2"></i>
                                        {t('sites.dashboard.components.iot.color')}
                                    </label>
                                    <div
                                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                                        style={{ backgroundColor: getPreviewColor() }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs w-12">Hue</span>
                                        <Slider
                                            size="sm"
                                            step={1}
                                            maxValue={100}
                                            minValue={0}
                                            value={hue}
                                            onChange={(value) => setHue(value as number)}
                                            onChangeEnd={(value) => handleColorChange(value as number, saturation)}
                                            isDisabled={isLoading || hasError}
                                            className="flex-1"
                                            classNames={{
                                                track: "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-pink-500",
                                            }}
                                        />
                                        <span className="text-xs w-8">{Math.round(hue)}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs w-12">Sat</span>
                                        <Slider
                                            size="sm"
                                            step={1}
                                            maxValue={100}
                                            minValue={0}
                                            value={saturation}
                                            onChange={(value) => setSaturation(value as number)}
                                            onChangeEnd={(value) => handleColorChange(hue, value as number)}
                                            isDisabled={isLoading || hasError}
                                            className="flex-1"
                                            classNames={{
                                                track: "bg-gradient-to-r from-gray-300 to-current",
                                            }}
                                            style={{
                                                // @ts-ignore
                                                '--current-color': getPreviewColor()
                                            }}
                                        />
                                        <span className="text-xs w-8">{Math.round(saturation)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Color Temperature Control */}
                        {device.supportsColorTemperature && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className={`${getFontSizeClass(layout?.fontSize)} font-medium`}>
                                        <i className="fa-solid fa-thermometer-half mr-2"></i>
                                        {t('sites.dashboard.components.iot.color_temperature')}
                                    </label>
                                    <div
                                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                                        style={{ backgroundColor: getColorTemperaturePreview() }}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs w-12">K</span>
                                    <Slider
                                        size="sm"
                                        step={50}
                                        maxValue={6500}
                                        minValue={1500}
                                        value={colorTemperature}
                                        onChange={(value) => setColorTemperature(value as number)}
                                        onChangeEnd={(value) => handleColorTemperatureChange(value as number)}
                                        isDisabled={isLoading || hasError}
                                        className="flex-1"
                                        classNames={{
                                            track: "bg-gradient-to-r from-orange-400 via-white to-blue-200",
                                        }}
                                    />
                                    <span className="text-xs w-12">{colorTemperature}K</span>
                                </div>
                            </div>
                        )}

                        {/* Brightness Control */}
                        {device.supportsBrightness && (
                            <div className="space-y-2">
                                <label className={`${getFontSizeClass(layout?.fontSize)} font-medium`}>
                                    <i className="fa-solid fa-sun mr-2"></i>
                                    {t('sites.dashboard.components.iot.brightness')}
                                </label>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs w-12">%</span>
                                    <Slider
                                        size="sm"
                                        step={1}
                                        maxValue={100}
                                        minValue={0}
                                        value={brightness}
                                        onChange={(value) => setBrightness(value as number)}
                                        onChangeEnd={(value) => handleBrightnessChange(value as number)}
                                        isDisabled={isLoading || hasError}
                                        className="flex-1"
                                        classNames={{
                                            track: "bg-gradient-to-r from-gray-800 to-yellow-200",
                                        }}
                                    />
                                    <span className="text-xs w-8">{Math.round(brightness)}%</span>
                                </div>
                            </div>
                        )}

                        {/* Status indicators */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-2">
                                <div className="animate-spin mr-2">
                                    <i className="fa-solid fa-spinner text-primary"></i>
                                </div>
                                <span className="text-xs">Updating...</span>
                            </div>
                        )}

                        {hasError && (
                            <div className="flex items-center justify-center py-2 text-danger">
                                <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                                <span className="text-xs">Error updating device</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}