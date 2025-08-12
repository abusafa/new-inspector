import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, type User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSave: () => void;
}

export function UserModal({ open, onOpenChange, user, onSave }: UserModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    role: 'Inspector',
    department: '',
    location: '',
    employeeId: '',
    supervisor: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email || '',
        role: user.role,
        department: user.department || '',
        location: user.location || '',
        employeeId: user.employeeId || '',
        supervisor: user.supervisor || '',
      });
    } else {
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        role: 'Inspector',
        department: '',
        location: '',
        employeeId: '',
        supervisor: '',
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        await api.users.update(user.id, formData);
      } else {
        await api.users.create(formData);
      }

      toast({
        title: user ? "User updated" : "User created",
        description: user ? "User has been updated successfully." : "New user has been created successfully.",
      });
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save user. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to save user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Edit User' : 'Create User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="Phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Email address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={formData.role} onValueChange={(value: string) => handleChange('role', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inspector">Inspector</SelectItem>
                <SelectItem value="Safety Supervisor">Safety Supervisor</SelectItem>
                <SelectItem value="Safety Manager">Safety Manager</SelectItem>
                <SelectItem value="Maintenance Lead">Maintenance Lead</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="Department"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Location"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee ID</label>
              <Input
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                placeholder="Employee ID"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Supervisor</label>
              <Input
                value={formData.supervisor}
                onChange={(e) => handleChange('supervisor', e.target.value)}
                placeholder="Supervisor name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : user ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
