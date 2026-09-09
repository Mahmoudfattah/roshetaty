import { cn } from "@/lib/utils";



interface IconProps {

name : string;
className? : string;
filled ?: boolean;
}

export default function Icon({ name, className, filled = false }: IconProps) {
    return(
        <span className={cn("material-symbols-outlined leading-0", className
        )}
         style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
            aria-hidden="true"
        >
            {name}
        </span>
    )
}