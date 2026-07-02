export const moneyCell = (amount: number) =>
  `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

export const bankDetailsCell = (
  bankName: string,
  accountNumberMasked: string,
) => (
  <div>
    <div className="text-[13px] font-medium text-gray-700">{bankName}</div>
    <div className="text-[11.5px] font-normal text-gray-400 tabular-nums font-mono">
      {accountNumberMasked}
    </div>
  </div>
);

export const codeCell = (code: string) => (
  <code className="rounded bg-muted px-1.5 py-0.5 text-[11.5px] text-gray-500 font-mono">
    {code}
  </code>
);


export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
