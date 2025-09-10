# FullPagePopup Component

A reusable Next.js TypeScript component for creating full-page modal popups with Tailwind CSS.

## Features

- **Full-page coverage**: 95% width and height, centered
- **Dark overlay**: Fixed inset-0 with transparent background
- **Responsive design**: Works on all screen sizes
- **Scrollable content**: Overflow-y-auto for long content
- **Customizable**: Accepts custom children or uses default document cards
- **TypeScript support**: Fully typed with proper interfaces

## Installation

Place the component files in your Next.js project:

```
src/
├── components/
│   ├── common/
│   │   └── FullPagePopup.tsx
│   └── example/
│       └── FullPagePopupExample.tsx
```

## Usage

### Basic Usage

```tsx
import React, { useState } from 'react';
import FullPagePopup from '@/components/common/FullPagePopup';

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Open Popup
      </button>

      <FullPagePopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Custom Title"
      />
    </div>
  );
};
```

### With Custom Content

```tsx
<FullPagePopup
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Custom Content"
>
  <div className="space-y-4">
    <h3>Custom Content Here</h3>
    <p>Add any content you want...</p>
  </div>
</FullPagePopup>
```

### Using DocumentCard Component

```tsx
import { DocumentCard } from '@/components/common/FullPagePopup';

<DocumentCard
  title="Carte Grise"
  subtitle="Vehicle Registration"
  color="blue"
  onFileChange={(file) => console.log('File selected:', file)}
  startDate="2024-01-01"
  endDate="2024-12-31"
  onStartDateChange={(date) => console.log('Start date:', date)}
  onEndDateChange={(date) => console.log('End date:', date)}
/>
```

## Props

### FullPagePopup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controls modal visibility |
| `onClose` | `() => void` | - | Callback when modal should close |
| `title` | `string` | `"Upload Car Documents"` | Header title |
| `children` | `React.ReactNode` | - | Custom content (optional) |

### DocumentCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Card title |
| `subtitle` | `string` | - | Card subtitle |
| `color` | `'blue' \| 'green' \| 'yellow' \| 'purple'` | - | Color theme |
| `onFileChange` | `(file: File \| null) => void` | - | File selection callback |
| `startDate` | `string` | - | Start date value |
| `endDate` | `string` | - | End date value |
| `onStartDateChange` | `(date: string) => void` | - | Start date change callback |
| `onEndDateChange` | `(date: string) => void` | - | End date change callback |

## Color Themes

The DocumentCard component supports 4 color themes:

- **Blue**: `from-blue-500 to-blue-600` - For Carte Grise
- **Green**: `from-green-500 to-emerald-600` - For Insurance
- **Yellow**: `from-yellow-500 to-orange-500` - For Technical Inspection
- **Purple**: `from-purple-500 to-pink-500` - For Rental Agreement

## Styling

The component uses Tailwind CSS classes and supports dark mode:

- **Light mode**: White backgrounds with gray borders
- **Dark mode**: Gray-800/900 backgrounds with appropriate text colors
- **Responsive**: Uses `md:grid-cols-2` for responsive grid layout
- **Animations**: Smooth transitions and hover effects

## Example Implementation

See `src/components/example/FullPagePopupExample.tsx` for a complete working example that demonstrates:

- State management for modal visibility
- Document state handling
- File upload callbacks
- Date input handling
- Custom styling

## Customization

You can easily customize the component by:

1. **Modifying colors**: Update the `colorClasses` object in DocumentCard
2. **Adding new props**: Extend the interfaces as needed
3. **Changing layout**: Modify the grid structure or spacing
4. **Adding animations**: Include additional Tailwind animation classes

## Browser Support

- Modern browsers with CSS Grid support
- Mobile responsive design
- Touch-friendly interface




