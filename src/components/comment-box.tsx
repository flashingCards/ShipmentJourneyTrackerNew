'use client';

import React, { useState } from 'react';
import {
  collection,
  query,
  where,
  serverTimestamp,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  addComment,
} from '@/firebase';
import type { NodeComment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronsUpDown, MessageSquarePlus } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface CommentBoxProps {
  shipmentScancode: string;
  nodeName: string;
}

// Redefine type locally for clarity, ensuring it matches lib/types.ts
interface Comment extends Omit<NodeComment, 'createdAt'> {
  createdAt: Timestamp | null;
}

export function CommentBox({ shipmentScancode, nodeName }: CommentBoxProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Memoize the Firestore query
  const commentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const commentsCollectionRef = collection(
      firestore,
      `shipments/${shipmentScancode}/node_comments`
    );
    return query(
        commentsCollectionRef,
        where('nodeName', '==', nodeName),
        orderBy('createdAt', 'desc')
    );
  }, [firestore, shipmentScancode, nodeName]);

  // 2. Use the robust useCollection hook
  const { data: comments, isLoading, error } = useCollection<Comment>(commentsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '' || authorName.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter your name and a remark.',
      });
      return;
    }
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Database not available' });
        return;
    }

    setIsSubmitting(true);
    
    const collectionRef = collection(firestore, `shipments/${shipmentScancode}/node_comments`);

    try {
        await addComment(collectionRef, authorName.trim(), message.trim(), nodeName);
        
        setAuthorName('');
        setMessage('');
        setIsFormOpen(false); // Close form on success
        toast({
            title: 'Success!',
            description: 'Your remark has been submitted.',
        });

    } catch (err) {
        console.error('Submission failed:', err);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'There was an error saving your remark. Please check permissions and try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Collapsible
      open={isFormOpen}
      onOpenChange={setIsFormOpen}
      className="mt-4 w-full space-y-4 rounded-lg border border-dashed bg-card/50 p-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Remarks ({comments?.length ?? 0})</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <MessageSquarePlus className="h-4 w-4" />
            <span className="sr-only">Add a remark</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      {/* Display Comments */}
      <div className="space-y-3">
        {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
            </div>
        )}
        {!isLoading && error && (
          <p className="text-xs text-destructive">Error loading remarks.</p>
        )}
        {!isLoading && !error && comments?.length === 0 && (
          <p className="text-xs text-muted-foreground">No remarks yet.</p>
        )}
        {comments?.map((comment) => (
          <div key={comment.id} className="text-sm rounded-md bg-background/50 p-3">
            <div className="flex items-baseline justify-between">
              <p className="font-semibold text-foreground">{comment.authorName}</p>
              <p className="text-xs text-muted-foreground">
                {comment.createdAt
                  ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })
                  : 'just now'}
              </p>
            </div>
            <p className="mt-1 break-words text-muted-foreground">{comment.message}</p>
          </div>
        ))}
      </div>

      <CollapsibleContent>
        <div className="border-t border-border pt-4"></div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Your Name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="bg-background"
            required
            disabled={isSubmitting}
          />
          <Textarea
            placeholder="Add a remark..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-background"
            required
            disabled={isSubmitting}
          />
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Remark'}
          </Button>
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}
