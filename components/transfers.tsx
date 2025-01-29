import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Transfer {
  from_address: string
  to_address: string
  value_decimal: string
  transaction_hash: string
}

interface TransfersProps {
  transfers: Transfer[]
  tokenSymbol: string
  chain: string
}

export function Transfers({ transfers, tokenSymbol, chain }: TransfersProps) {
  return (
    <ScrollArea className="h-full rounded-lg overflow-hidden">
      <div className="p-6">
    
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From Address</TableHead>
              <TableHead>To Address</TableHead>
              <TableHead>Value {tokenSymbol}</TableHead>
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
                    {`${transfer.transaction_hash.slice(0, 6)}...${transfer.transaction_hash.slice(-4)}`}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  )
}

