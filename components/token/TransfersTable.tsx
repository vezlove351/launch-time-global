import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table"

interface Transfer {
  from_address: string
  to_address: string
  value_decimal: string
  transaction_hash: string
}

interface TransfersTableProps {
  transfers: Transfer[]
  symbol: string
  chain: string
}

export function TransfersTable({ transfers, symbol, chain }: TransfersTableProps) {
  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 mt-6">
      <h3 className="text-2xl font-bold text-white mr-2 p-2">Transfers</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>From Address</TableHead>
            <TableHead>To Address</TableHead>
            <TableHead>Value {symbol}</TableHead>
            <TableHead>Transaction Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.map((transfer, index) => (
            <TableRow key={index}>
              <TableCell>{`${transfer.from_address.slice(0, 6)}...${transfer.from_address.slice(-4)}`}</TableCell>
              <TableCell>{`${transfer.to_address.slice(0, 6)}...${transfer.to_address.slice(-4)}`}</TableCell>
              <TableCell>{transfer.value_decimal}</TableCell>
              <TableCell>
                <a
                  href={`https://${chain}scan.com/tx/${transfer.transaction_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {transfer.transaction_hash}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

