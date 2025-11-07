import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, Slider, Button } from '@heroui/react';
import { IoTDevice } from '../../../../../../domain/types';
import { Layout } from '../../../../../../domain/entities/Layout';
import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import { getFontSizeClass } from '@sites/Dashboard/helper';
import { useTheme } from 'next-themes';

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
    const panelRef = useRef<HTMLDivElement>(null);

    // Local state for live preview during dragging
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(100);
    const [colorTemperature, setColorTemperature] = useState(3000);
    const [brightness, setBrightness] = useState(100);

    // Panel state - closed by default
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsPanelOpen(false);
            }
        };

        if (isPanelOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isPanelOpen]);

    // Convert HSB to HSL for CSS display
    const getPreviewColor = useCallback(() => {
        const h = (hue * 360) / 100;
        const s = saturation;
        const l = 50;
        return `hsl(${h}, ${s}%, ${l}%)`;
    }, [hue, saturation]);

    // Color temperature preview
    const getColorTemperaturePreview = useCallback(() => {
        const normalizedTemp = Math.max(1500, Math.min(6500, colorTemperature));
        if (normalizedTemp <= 2700) {
            return '#FFA500';
        } else if (normalizedTemp <= 4000) {
            return '#FFE4B5';
        } else if (normalizedTemp <= 5000) {
            return '#FFFAF0';
        } else {
            return '#E6F3FF';
        }
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
        return null;
    }

    return (
        <div className="relative">
            {/* Color Control Button */}
            <Button
                size="sm"
                variant="ghost"
                isIconOnly
                onPress={() => setIsPanelOpen(!isPanelOpen)}
                isDisabled={isLoading || hasError}
                className="ml-2"
                title="Farbsteuerung öffnen"
            >
                <i className="fa-solid fa-palette"></i>
            </Button>

            {/* Overlay Panel */}
            {isPanelOpen && (
                <div
                    ref={panelRef}
                    className="absolute top-full right-0 mt-2 z-50 w-80 max-h-96 overflow-y-auto"
                    style={{
                        maxWidth: '320px',
                        transform: 'translateX(0)',
                    }}
                >
                    <Card
                        className="p-4 shadow-2xl border"
                        style={getCustomColorCssClass(layout, theme)}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className={`${getFontSizeClass(layout?.fontSize)} font-medium`}>
                                    <i className="fa-solid fa-palette mr-2"></i>
                                    Farbsteuerung
                                </h4>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    isIconOnly
                                    onPress={() => setIsPanelOpen(false)}
                                >
                                    <i className="fa-solid fa-times"></i>
                                </Button>
                            </div>

                            {/* Brightness Control - moved to top */}
                            {device.supportsBrightness && (
                                <div className="space-y-2">
                                    <label className={`${getFontSizeClass(layout?.fontSize)} font-medium flex items-center`}>
                                        <i className="fa-solid fa-sun mr-2"></i>
                                        Helligkeit
                                    </label>

                                    <div className="flex items-center gap-2">
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
                                        <span className="text-xs w-12 text-right">{Math.round(brightness)}%</span>
                                    </div>

                                    {/* Quick Brightness Presets */}
                                    <div className="flex gap-1">
                                        {[10, 25, 50, 75, 100].map((preset) => (
                                            <Button
                                                key={preset}
                                                size="sm"
                                                variant="flat"
                                                className="min-w-0 px-2 text-xs h-6 flex-1"
                                                onPress={() => handleBrightnessChange(preset)}
                                                isDisabled={isLoading || hasError}
                                            >
                                                {preset}%
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Color Control (HSB) */}
                            {device.supportsColor && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className={`${getFontSizeClass(layout?.fontSize)} font-medium flex items-center`}>
                                            <i className="fa-solid fa-droplet mr-2"></i>
                                            Farbe
                                        </label>
                                        <div
                                            className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm cursor-pointer"
                                            style={{ backgroundColor: getPreviewColor() }}
                                            title={`Hue: ${Math.round(hue)}, Saturation: ${Math.round(saturation)}%`}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs w-8">Hue</span>
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
                                            <span className="text-xs w-8 text-right">{Math.round(hue)}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs w-8">Sat</span>
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
                                                    track: "bg-gradient-to-r from-gray-300 via-gray-100 to-current",
                                                }}
                                            />
                                            <span className="text-xs w-8 text-right">{Math.round(saturation)}</span>
                                        </div>
                                    </div>

                                    {/* Quick Color Presets */}
                                    <div className="pt-1">
                                        <div className="grid grid-cols-8 gap-1">
                                            {[
                                                { name: 'Rot', hue: 0, saturation: 100, color: '#ff0000' },
                                                { name: 'Orange', hue: 8, saturation: 100, color: '#ff8000' },
                                                { name: 'Gelb', hue: 17, saturation: 100, color: '#ffff00' },
                                                { name: 'Grün', hue: 33, saturation: 100, color: '#00ff00' },
                                                { name: 'Cyan', hue: 50, saturation: 100, color: '#00ffff' },
                                                { name: 'Blau', hue: 67, saturation: 100, color: '#0000ff' },
                                                { name: 'Lila', hue: 83, saturation: 100, color: '#8000ff' },
                                                { name: 'Pink', hue: 92, saturation: 100, color: '#ff00ff' },
                                            ].map((preset) => (
                                                <Button
                                                    key={preset.name}
                                                    size="sm"
                                                    variant="flat"
                                                    className="min-w-0 p-0 h-6 w-6"
                                                    onPress={() => handleColorChange(preset.hue, preset.saturation)}
                                                    isDisabled={isLoading || hasError}
                                                    style={{
                                                        backgroundColor: preset.color,
                                                        border: '1px solid rgba(255,255,255,0.3)',
                                                    }}
                                                    title={preset.name}
                                                >
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Color Temperature Control */}
                            {device.supportsColorTemperature && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className={`${getFontSizeClass(layout?.fontSize)} font-medium flex items-center`}>
                                            <i className="fa-solid fa-thermometer-half mr-2"></i>
                                            Farbtemperatur
                                        </label>
                                        <div
                                            className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm"
                                            style={{ backgroundColor: getColorTemperaturePreview() }}
                                            title={`${colorTemperature}K`}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
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
                                        <span className="text-xs w-12 text-right">{colorTemperature}K</span>
                                    </div>

                                    {/* Quick Temperature Presets */}
                                    <div className="flex gap-1">
                                        {[
                                            { name: 'Warm', value: 2700 },
                                            { name: 'Soft', value: 3500 },
                                            { name: 'Cool', value: 5000 },
                                            { name: 'Day', value: 6500 },
                                        ].map((preset) => (
                                            <Button
                                                key={preset.name}
                                                size="sm"
                                                variant="flat"
                                                className="min-w-0 px-2 text-xs h-6 flex-1"
                                                onPress={() => handleColorTemperatureChange(preset.value)}
                                                isDisabled={isLoading || hasError}
                                            >
                                                {preset.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status indicators */}
                            {isLoading && (
                                <div className="flex items-center justify-center py-2">
                                    <div className="animate-spin mr-2">
                                        <i className="fa-solid fa-spinner"></i>
                                    </div>
                                    <span className="text-sm">Wird geändert...</span>
                                </div>
                            )}

                            {hasError && (
                                <div className="flex items-center justify-center py-2 text-red-500">
                                    <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                                    <span className="text-sm">Fehler beim Ändern</span>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}