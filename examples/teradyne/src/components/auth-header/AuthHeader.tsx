'use client';

import type React from 'react';
import Link from 'next/link';
import { ChevronDown, LogOut } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LOGIN_HREF = '/login';

export const AuthHeader: React.FC = () => {
  const { user, isReady, logout } = useAuth();

  if (!isReady) {
    return (
      <div
        className="bg-muted/40 h-9 min-w-[9rem] animate-pulse rounded-md"
        aria-hidden
        data-auth-header="loading"
      />
    );
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" asChild className="shrink-0 font-medium">
        <Link href={LOGIN_HREF} prefetch={false}>
          Login
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-foreground hover:bg-muted/80 max-w-[14rem] shrink gap-1 px-2 font-normal"
        >
          <span className="truncate">
            Welcome, <span className="font-medium">{user.displayName}</span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuItem onSelect={() => logout()} className="cursor-pointer gap-2">
          <LogOut className="size-4" aria-hidden />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
