'use client';

import { useState, useEffect } from 'react';

export default function V2Footer() {
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="v2-footer">
      &copy; {year} Ajay Dangol. All rights reserved.
    </footer>
  );
}
