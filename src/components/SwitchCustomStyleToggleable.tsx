import { Switch } from "@material-tailwind/react";


export function SwitchCustomStyleToggleable() {
    return (
        <div className="flex items-center gap-4">
            <Switch
                id="custom-switch-component"
                ripple={false}
                className="h-full w-full checked:bg-[#446FC7]"
                containerProps={{
                    className: "w-11 h-6",
                }}
                circleProps={{
                    className: "before:hidden left-0.5 border-none",
                }} onResize={undefined} onResizeCapture={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined} />
        </div>
    );
}