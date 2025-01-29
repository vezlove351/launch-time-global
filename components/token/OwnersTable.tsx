import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table"

interface Owner {
  owner_address: string
  percentage_relative_to_total_supply: string
}

interface OwnersTableProps {
  owners: Owner[]
}

export function OwnersTable({ owners }: OwnersTableProps) {
  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 mt-6">
      <h2 className="text-2xl font-bold text-white mr-2 p-2">Owners</h2>
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
  )
}

