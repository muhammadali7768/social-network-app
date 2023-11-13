import { ReactNode } from 'react';

interface ListProps {
  children: ReactNode;
}
export default function ContactList({ children }:ListProps) {
    return (
      <ul className="divide-y divide-slate-200">
        {children}
      </ul>
    )
  }