import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Mail, Phone, Building, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Contact {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  company?: string;
  project_type?: string;
  budget_range?: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export default function ContactsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [adminNotes, setAdminNotes] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Contact[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const updateData: any = { status };
      if (notes !== undefined) {
        updateData.admin_notes = notes;
      }
      
      const { error } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
      toast({ title: 'Contact updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating contact', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
      toast({ title: 'Contact deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting contact', description: error.message, variant: 'destructive' });
    },
  });

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setAdminNotes(contact.admin_notes || '');
    setIsDialogOpen(true);
    
    // Mark as read if it's new
    if (contact.status === 'new') {
      updateStatusMutation.mutate({ id: contact.id, status: 'read' });
    }
  };

  const handleStatusChange = (status: string) => {
    if (selectedContact) {
      updateStatusMutation.mutate({ 
        id: selectedContact.id, 
        status, 
        notes: adminNotes 
      });
      setSelectedContact({ ...selectedContact, status: status as any, admin_notes: adminNotes });
    }
  };

  const handleNotesUpdate = () => {
    if (selectedContact) {
      updateStatusMutation.mutate({ 
        id: selectedContact.id, 
        status: selectedContact.status,
        notes: adminNotes 
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this contact message?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-500';
      case 'read': return 'bg-blue-500';
      case 'replied': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredContacts = contacts?.filter(contact => 
    statusFilter === 'all' || contact.status === statusFilter
  ) || [];

  if (isLoading) {
    return <div>Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contact Messages</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className={contact.status === 'new' ? 'border-red-200 bg-red-50/50' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {contact.name}
                    <Badge variant="outline" className={`text-white ${getStatusColor(contact.status)}`}>
                      {contact.status}
                    </Badge>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    <div className="flex items-center gap-4">
                      <span>{contact.email}</span>
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </span>
                      )}
                      {contact.company && (
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {contact.company}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(contact.created_at).toLocaleString()}
                    </div>
                  </div>
                  {contact.subject && (
                    <p className="text-sm font-medium mt-2">Subject: {contact.subject}</p>
                  )}
                  <p className="text-sm mt-2 line-clamp-2">{contact.message}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleViewContact(contact)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(contact.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {(contact.project_type || contact.budget_range) && (
              <CardContent>
                <div className="flex gap-2 text-xs">
                  {contact.project_type && (
                    <Badge variant="secondary">Project: {contact.project_type}</Badge>
                  )}
                  {contact.budget_range && (
                    <Badge variant="secondary">Budget: {contact.budget_range}</Badge>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Contact Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{selectedContact.email}</p>
                </div>
              </div>

              {(selectedContact.phone || selectedContact.company) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedContact.phone && (
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm">{selectedContact.phone}</p>
                    </div>
                  )}
                  {selectedContact.company && (
                    <div>
                      <Label>Company</Label>
                      <p className="text-sm">{selectedContact.company}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedContact.subject && (
                <div>
                  <Label>Subject</Label>
                  <p className="text-sm font-medium">{selectedContact.subject}</p>
                </div>
              )}

              <div>
                <Label>Message</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              {(selectedContact.project_type || selectedContact.budget_range) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedContact.project_type && (
                    <div>
                      <Label>Project Type</Label>
                      <p className="text-sm">{selectedContact.project_type}</p>
                    </div>
                  )}
                  {selectedContact.budget_range && (
                    <div>
                      <Label>Budget Range</Label>
                      <p className="text-sm">{selectedContact.budget_range}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={selectedContact.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">{new Date(selectedContact.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Add internal notes..."
                />
                <Button 
                  size="sm" 
                  className="mt-2" 
                  onClick={handleNotesUpdate}
                  disabled={updateStatusMutation.isPending}
                >
                  Update Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}