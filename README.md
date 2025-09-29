## Contri Graph

A powerful and customizable GitHub contribution graph visualizer that transforms your contribution data into beautiful, downloadable charts and graphs. Perfect for portfolios, presentations, and personal analytics.

## ✨ Features

### 🎨 Multiple Visualization Modes

#### **Grid Views**

- **2D Grid**: Classic GitHub-style contribution heatmap with customizable appearance
- **3D Grid**: Interactive 3D cube visualization with camera controls and transparent background

#### **Chart Views**

Six different chart types with multiple variants each:

- **📊 Bar Charts**
  - Default, Horizontal, Label, Month Labelled variants
- **📈 Area Charts**
  - Default, Stacked, Gradient, Smooth variants
- **📉 Line Charts**
  - Default, Smooth, Stepped, Dashed variants
- **🥧 Pie Charts**
  - Default, Stacked, Interactive, Donut variants
- **🎯 Radar Charts**
  - Default, Lines Only, Grid Filled, Grid Circle Filled, Grid None variants
- **⭕ Radial Charts**
  - Default, Progress, Multi, Gauge variants

### 🎨 Extensive Customization Options

#### **Color Themes**

25+ beautiful pre-designed color palettes:

- **Nature**: Teal Mint, Forest, Leaf, Ocean
- **Warm**: Sunset, Mango, Fire, Autumn Haze
- **Cool**: Aurora, Ice, Lavender, Midnight
- **Vibrant**: Neon Dream, Cyberpunk, Vaporwave
- **Classic**: Silver, Onyx Black, Sand
- **And many more!**

#### **Grid Customization**

- **Opacity Range**: Adjustable min/max opacity for contribution intensity
- **Dot Size**: Configurable size from 4-28px
- **Gap**: Spacing between elements (0-12px)
- **Shape Options**: Rounded, Square, Circle, Diamond, Triangle, Hexagon

#### **3D View Controls** (New!)

- **Individual Angle Controls**: X, Y, Z axis rotation (0-360°)
- **Quick Angle Presets**:
  - Default (45°) - Balanced perspective
  - Perspective (30°, 60°, 30°) - Natural viewing angle
  - Top View (90°, 0°, 0°) - Bird's eye view
  - Side View (0°, 90°, 0°) - Profile perspective
  - Isometric (0°, 45°, 90°) - Technical drawing style
  - Tilted (60°, 30°, 60°) - Artistic angle

### 🔧 Advanced Features

- **Custom Base Color**: Hex color picker and input
- **Real-time Preview**: See changes instantly as you customize
- **Download Capability**: Export your visualizations as high-quality images
- **Responsive Design**: Works beautifully on desktop and mobile
- **Dark/Light Theme**: Automatic theme switching support
- **GitHub Integration**: Fetch contribution data directly from any GitHub username

### 🚀 Getting Started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` to view the app.

## 🎯 How to Use

1. **Enter GitHub Username**: Type any GitHub username in the search box
2. **Choose Visualization**: Switch between Graphs (2D/3D grids) and Charts modes
3. **Select Style**: Pick from 25+ color palettes and chart types
4. **Customize**: Adjust opacity, size, gaps, shapes, and 3D angles
5. **Download**: Export your creation as a high-quality PNG image

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI**: Tailwind CSS + Radix UI components
- **3D Graphics**: Three.js with React Three Fiber
- **Charts**: Recharts for data visualization
- **State Management**: Zustand
- **Type Safety**: TypeScript throughout
- **Code Quality**: Biome for linting and formatting

### Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Lint with Biome
- `pnpm format`: Format with Biome

## 🤝 Contributing

I welcome contributions!

1. Fork the repo and create a feature branch.
2. Enable PNPM and install deps: `pnpm install`.
3. Run locally: `pnpm dev`.
4. Follow the existing code style; run `pnpm lint` and `pnpm format` before committing.
5. Write clear PR titles and descriptions. Include screenshots for UI changes.

#### Commit Conventions

Use concise, descriptive messages. Conventional Commits are appreciated (e.g., `feat: add graph theme presets`).

#### Issue Reporting

Please include steps to reproduce, expected vs actual behavior, and environment details.

### License

MIT
