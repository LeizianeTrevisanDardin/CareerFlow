import {
    Bell,
    Search,
} from "lucide-react";



export default function Header () {
    return(
        <header className="flex h-20 items-center justify-between border-b bg-white px-8">
           <div className="relative w-[320px]">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search Careerflow"
              className="w-full rounded-xl border py-3 pl-12 pr-4"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-full border px-4 py-2 text-sm font-medium">
              84 credits
            </div>

            <button className="flex h-10 w-10 items-center justify-center rounded-full border">
              <Bell className="h-5 w-5" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
              LT
            </div>

            <div className="leading-tight">
              <p className="text-sm font-semibold">
                Leiziane Trevisan Dardin
              </p>

              <p className="text-xs text-gray-500">
                Software Developer
              </p>
            </div>
          </div>
        </header>
    )
}