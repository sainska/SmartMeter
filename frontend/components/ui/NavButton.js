'use client';

import { useRouter } from 'next/navigation';
import { Button } from './index';

export function NavButton({ href, onClick, children, ...props }) {
  const router = useRouter();

  if (href) {
    return (
      <Button href={href} {...props}>
        {children}
      </Button>
    );
  }

  return (
    <Button
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (href) router.push(href);
      }}
    >
      {children}
    </Button>
  );
}
