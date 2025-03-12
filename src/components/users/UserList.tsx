import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Shield,
  User,
  UserX,
  Key,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Permission, UserRole } from "@/hooks/useRoleBasedAccess";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
  role?: string;
  is_active?: boolean;
  permissions?: string[];
}

// Get default permissions for a role
const getDefaultPermissionsForRole = (role: string): Permission[] => {
  switch (role) {
    case "admin":
      return [
        "manage_brands",
        "manage_influencers",
        "manage_campaigns",
        "manage_finances",
        "view_finances",
        "process_payments",
        "view_brand_price",
        "edit_deliverables",
        "view_analytics",
        "admin_settings",
      ];
    case "brand_manager":
      return [
        "manage_brands",
        "view_brand_price",
        "edit_deliverables",
        "view_analytics",
      ];
    case "influencer_manager":
      return ["manage_influencers", "edit_deliverables", "view_analytics"];
    case "finance":
      return [
        "view_finances",
        "manage_finances",
        "process_payments",
        "view_brand_price",
        "view_analytics",
      ];
    default:
      return [];
  }
};

const UserList = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Form states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("brand_manager");
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Available permissions
  const availablePermissions = [
    { id: "manage_brands", label: "Manage Brands" },
    { id: "manage_influencers", label: "Manage Influencers" },
    { id: "manage_campaigns", label: "Manage Campaigns" },
    { id: "manage_finances", label: "Manage Finances" },
    { id: "view_finances", label: "View Finances" },
    { id: "process_payments", label: "Process Payments" },
    { id: "view_brand_price", label: "View Brand Price" },
    { id: "edit_deliverables", label: "Edit Deliverables" },
    { id: "view_analytics", label: "View Analytics" },
    { id: "admin_settings", label: "Admin Settings" },
  ];

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Fetch users from Supabase Auth
        const { data: authUsers, error: authError } =
          await supabase.auth.admin.listUsers();

        if (authError) throw authError;

        // Fetch user roles from the database
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("*");

        if (rolesError) throw rolesError;

        // Combine the data
        const combinedUsers = authUsers.users.map((user) => {
          const userRole = userRoles?.find((role) => role.user_id === user.id);
          return {
            ...user,
            role: userRole?.role || "user",
            is_active: !user.banned,
            permissions: userRole?.permissions || [],
          };
        });

        setUsers(combinedUsers);
        setFilteredUsers(combinedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  // Filter users based on search query and active tab
  useEffect(() => {
    let filtered = [...users];

    // Filter by tab
    if (activeTab === "admin") {
      filtered = filtered.filter((user) => user.role === "admin");
    } else if (activeTab === "brand_manager") {
      filtered = filtered.filter((user) => user.role === "brand_manager");
    } else if (activeTab === "influencer_manager") {
      filtered = filtered.filter((user) => user.role === "influencer_manager");
    } else if (activeTab === "finance") {
      filtered = filtered.filter((user) => user.role === "finance");
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((user) => !user.is_active);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.user_metadata?.name?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query),
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, activeTab]);

  // Handle user invitation
  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteRole) {
      toast({
        title: "Missing information",
        description: "Please provide an email and select a role.",
        variant: "destructive",
      });
      return;
    }

    setInviteLoading(true);
    try {
      // Create a new user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: inviteEmail,
        email_confirm: true,
        user_metadata: {
          role: inviteRole,
        },
        app_metadata: {
          role: inviteRole,
        },
      });

      if (error) throw error;

      // Create a user role record in the database with default permissions
      const defaultPermissions = getDefaultPermissionsForRole(inviteRole);
      const { error: roleError } = await supabase.from("user_roles").insert([
        {
          user_id: data.user.id,
          role: inviteRole,
          permissions: defaultPermissions,
        },
      ]);

      if (roleError) throw roleError;

      toast({
        title: "User created",
        description: `User ${inviteEmail} created with role: ${inviteRole}`,
      });

      // Reset form and close dialog
      setInviteEmail("");
      setInviteRole("brand_manager");
      setIsInviteDialogOpen(false);

      // Refresh user list
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const { data: userRoles } = await supabase.from("user_roles").select("*");

      const combinedUsers = authUsers.users.map((user) => {
        const userRole = userRoles?.find((role) => role.user_id === user.id);
        return {
          ...user,
          role: userRole?.role || "user",
          is_active: !user.banned,
          permissions: userRole?.permissions || [],
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "User creation failed",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  // Handle opening edit dialog
  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    setEditName(user.user_metadata?.name || "");
    setEditRole(user.role || "user");
    setEditIsActive(user.is_active !== false);
    setEditPermissions(user.permissions || []);
    setIsEditDialogOpen(true);
  };

  // Handle user update
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setEditLoading(true);
    try {
      // Update user metadata
      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        selectedUser.id,
        {
          user_metadata: {
            ...selectedUser.user_metadata,
            name: editName,
          },
          banned: !editIsActive,
        },
      );

      if (metadataError) throw metadataError;

      // Update user role
      const { error: roleError } = await supabase.from("user_roles").upsert(
        {
          user_id: selectedUser.id,
          role: editRole,
          permissions: editPermissions,
        },
        { onConflict: "user_id" },
      );

      if (roleError) throw roleError;

      toast({
        title: "User updated",
        description: `${selectedUser.email}'s information has been updated.`,
      });

      // Refresh user list
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const { data: userRoles } = await supabase.from("user_roles").select("*");

      const combinedUsers = authUsers.users.map((user) => {
        const userRole = userRoles?.find((role) => role.user_id === user.id);
        return {
          ...user,
          role: userRole?.role || "user",
          is_active: !user.banned,
          permissions: userRole?.permissions || [],
        };
      });

      setUsers(combinedUsers);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Update failed",
        description: "Failed to update user information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Handle opening delete dialog
  const handleDeleteClick = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setDeleteLoading(true);
    try {
      // Delete user from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        selectedUser.id,
      );

      if (authError) throw authError;

      // Delete user role from the database
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.id);

      if (roleError) throw roleError;

      toast({
        title: "User deleted",
        description: `${selectedUser.email} has been deleted.`,
      });

      // Refresh user list
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const { data: userRoles } = await supabase.from("user_roles").select("*");

      const combinedUsers = authUsers.users.map((user) => {
        const userRole = userRoles?.find((role) => role.user_id === user.id);
        return {
          ...user,
          role: userRole?.role || "user",
          is_active: !user.banned,
          permissions: userRole?.permissions || [],
        };
      });

      setUsers(combinedUsers);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toggle permission in edit form
  const togglePermission = (permissionId: string) => {
    if (editPermissions.includes(permissionId)) {
      setEditPermissions(editPermissions.filter((id) => id !== permissionId));
    } else {
      setEditPermissions([...editPermissions, permissionId]);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "brand_manager":
        return "bg-blue-100 text-blue-800";
      case "influencer_manager":
        return "bg-orange-100 text-orange-800";
      case "finance":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account with specified role and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invite-email" className="text-right">
                Email
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@example.com"
                className="col-span-3"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invite-role" className="text-right">
                Role
              </Label>
              <Select
                value={inviteRole}
                onValueChange={(value) => setInviteRole(value)}
              >
                <SelectTrigger id="invite-role" className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="brand_manager">Brand Manager</SelectItem>
                  <SelectItem value="influencer_manager">
                    Influencer Manager
                  </SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleInviteUser} disabled={inviteLoading}>
              {inviteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedUser.user_metadata?.avatar_url}
                    alt={selectedUser.user_metadata?.name || selectedUser.email}
                  />
                  <AvatarFallback>
                    {(
                      selectedUser.user_metadata?.name?.[0] ||
                      selectedUser.email[0]
                    ).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.email}</p>
                  <p className="text-sm text-muted-foreground">
                    User ID: {selectedUser.id.substring(0, 8)}...
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  placeholder="User's name"
                  className="col-span-3"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Select
                  value={editRole}
                  onValueChange={(value) => setEditRole(value)}
                >
                  <SelectTrigger id="edit-role" className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="brand_manager">Brand Manager</SelectItem>
                    <SelectItem value="influencer_manager">
                      Influencer Manager
                    </SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="edit-status"
                    checked={editIsActive}
                    onCheckedChange={setEditIsActive}
                  />
                  <Label htmlFor="edit-status">
                    {editIsActive ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right pt-2">Permissions</Label>
                <div className="col-span-3 space-y-2">
                  {availablePermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <Switch
                        id={`permission-${permission.id}`}
                        checked={editPermissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                      <Label htmlFor={`permission-${permission.id}`}>
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={editLoading}>
              {editLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedUser.user_metadata?.avatar_url}
                    alt={selectedUser.user_metadata?.name || selectedUser.email}
                  />
                  <AvatarFallback>
                    {(
                      selectedUser.user_metadata?.name?.[0] ||
                      selectedUser.email[0]
                    ).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Role: {selectedUser.role}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="brand_manager">Brand Managers</TabsTrigger>
          <TabsTrigger value="influencer_manager">
            Influencer Managers
          </TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all"
                  ? "All Users"
                  : activeTab === "inactive"
                    ? "Inactive Users"
                    : `${activeTab.replace("_", " ")} Users`}
              </CardTitle>
              <CardDescription>
                {activeTab === "all"
                  ? "Manage all users and their permissions"
                  : activeTab === "inactive"
                    ? "View and manage inactive user accounts"
                    : `Manage ${activeTab.replace("_", " ")} users and their permissions`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-10 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">
                    No users found. Add your first user to get started.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 bg-muted/50 p-4 text-sm font-medium">
                    <div className="col-span-2">User</div>
                    <div>Role</div>
                    <div>Status</div>
                    <div>Last Sign In</div>
                    <div>Actions</div>
                  </div>
                  <div className="divide-y">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="grid grid-cols-6 items-center p-4"
                      >
                        <div className="col-span-2 flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.user_metadata?.avatar_url}
                              alt={user.user_metadata?.name || user.email}
                            />
                            <AvatarFallback>
                              {(
                                user.user_metadata?.name?.[0] || user.email[0]
                              ).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.user_metadata?.name || "Unnamed User"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Badge className={getRoleBadgeColor(user.role || "")}>
                            {user.role?.replace("_", " ") || "User"}
                          </Badge>
                        </div>
                        <div>
                          {user.is_active ? (
                            <Badge className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground">
                          {formatDate(user.last_sign_in_at)}
                        </div>
                        <div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleEditClick(user)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" /> Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="mr-2 h-4 w-4" /> Reset
                                Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserList;
