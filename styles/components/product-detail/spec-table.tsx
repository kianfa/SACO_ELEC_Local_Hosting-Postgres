interface SpecTableProps {
  specs: { label: string; value: string }[]
}

export function SpecTable({ specs }: SpecTableProps) {
  return (
    <div dir="rtl" className="border border-border rounded-2xl overflow-hidden text-right">
      <table dir="rtl" className="w-full text-right">
        <tbody dir="rtl">
          {specs.map((spec, index) => (
            <tr
              key={index}
              dir="rtl"
              className={`${
                index % 2 === 0 ? "bg-muted/30" : "bg-card"
              } block sm:table-row hover:bg-muted/50 transition-colors`}
            >
              <td dir="rtl" className="block w-full px-4 pt-3 pb-1 text-right font-medium text-muted-foreground sm:table-cell sm:w-1/3 sm:border-l sm:border-border sm:py-3">
                {spec.label}
              </td>
              <td dir="rtl" className="block w-full px-4 pt-1 pb-3 text-right text-foreground sm:table-cell sm:py-3">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
