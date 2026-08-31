export default function AppLogo() {
    return (
        <>
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
                <img src="/logo.png" alt="AutoFuel" className="h-full w-full scale-125 object-contain" />
            </div>
            <div className="ml-2 grid flex-1 text-left">
                <span className="truncate font-['Arial_Narrow'] text-lg leading-none font-black tracking-wider uppercase italic">
                    AutoFuel
                </span>
                <span className="mt-1 truncate text-[8px] leading-none font-bold tracking-[0.24em] text-primary uppercase">
                    Performance · Power · Passion
                </span>
            </div>
        </>
    );
}
