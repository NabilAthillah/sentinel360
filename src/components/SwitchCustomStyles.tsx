import { Switch } from "@material-tailwind/react";


export function SwitchCustomStyles({checked, label}:{checked: boolean, label: string}) {
    return (
        <div className="flex items-center gap-4">
            <Switch
                id="custom-switch-component"
                ripple={false}
                checked={checked}
                className="h-full w-full checked:bg-[#446FC7]"
                containerProps={{
                    className: "w-11 h-6",
                }}
                circleProps={{
                    className: "before:hidden left-0.5 border-none",
                }} onResize={undefined} onResizeCapture={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined} />
            <p className={`font-medium text-sm ${ checked ? 'text-[#19CE74]' : 'text-[#FF7E6A]'}`}>{label}</p>
        </div>
    );
}