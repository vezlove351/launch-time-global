import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Owner {
  owner_address: string
  percentage_relative_to_total_supply: string
}

interface OwnersProps {
  owners: Owner[]
}

export function Owners({ owners }: OwnersProps) {
  return (
    <ScrollArea className="h-full rounded-lg overflow-hidden">
      <div className="p-6">
   
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Owner Address</TableHead>
              <TableHead>Percentage of Total Supply</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {owners.map((owner, index) => (
              <TableRow key={index}>
                <TableCell>{owner.owner_address}</TableCell>
                <TableCell>{owner.percentage_relative_to_total_supply}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  )
}

