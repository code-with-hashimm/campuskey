"use client";

import { useState } from "react";
import { updateUserRole } from "./actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
};

export default function UserTableClient({ users }: { users: UserProfile[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setProcessingId(userId);
    const res = await updateUserRole(userId, newRole);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Role updated successfully.`);
    }
    setProcessingId(null);
  };

  return (
    <Card className="col-span-full shadow-sm">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>Account Name</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Privilege Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-slate-900 border-b">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell className="text-slate-500 border-b">{user.email}</TableCell>
                  <TableCell className="text-slate-500 border-b">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="border-b">
                    <Badge variant="secondary" className={
                      user.role === "admin" 
                      ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-100" 
                      : "bg-slate-100 text-slate-800 hover:bg-slate-100"
                    }>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right border-b">
                    {processingId === user.id ? (
                      <div className="flex justify-end p-2">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      </div>
                    ) : (
                      <div className="flex justify-end w-full">
                        <Select 
                          defaultValue={user.role} 
                          onValueChange={(val) => handleRoleChange(user.id, val)}
                        >
                          <SelectTrigger className="w-[120px] h-8 text-xs bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
