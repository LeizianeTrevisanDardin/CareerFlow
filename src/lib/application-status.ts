export function getStatusStyles(status: string) {
  switch (status) {
    case "saved":
      return "bg-slate-100 text-slate-700";

    case "applied":
      return "bg-emerald-50 text-emerald-700";

    case "interview":
      return "bg-blue-50 text-blue-700";

    case "offer":
      return "bg-green-100 text-green-800";

    case "rejected":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}