import { Switch } from "@material-tailwind/react";

type SwitchCustomStylesProps = {
    checked: boolean;
    onChange?: (value: boolean) => void;
    labelTrue: string;
    labelFalse: string;
};

export function SwitchCustomStyles({ checked, onChange, labelTrue, labelFalse }: SwitchCustomStylesProps) {
    return (
        <div className="flex items-center gap-4 w-40">
            <Switch
                id="custom-switch-component"
                ripple={false}
                checked={checked}
                onChange={(e) => onChange && onChange(e.target.checked)}
                className="h-full w-full checked:bg-[#446FC7]"
                containerProps={{
                    className: "w-11 h-6",
                }}
                circleProps={{
                    className: "before:hidden left-0.5 border-none",
                }} onResize={undefined} onResizeCapture={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined} />
            <p className={`font-medium text-sm ${checked ? 'text-[#19CE74]' : 'text-[#FF7E6A]'}`}>
                {checked ? labelTrue : labelFalse}
            </p>
        </div>
    );
}
