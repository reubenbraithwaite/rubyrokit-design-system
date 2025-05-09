# RubyRokit Design System

A web-based parametric design system for creating customizable bottle rocket kits. Generate SVG templates for physical construction with constraints based on materials and cutting methods.

## Project Overview

The RubyRokit Design System is a comprehensive software ecosystem that enables users to design, produce, and customize bottle rocket kits through an intuitive web interface. At its core is a parametric design tool that enforces engineering constraints while providing creative freedom.

### Key Features

- Interactive Bezier control system for rocket component design
- Support for multiple cutting methods (digital, hand, laser cutting)
- SVG template generation for physical construction
- Real-time physics calculations for stability and performance
- Component relationship management with structural validation
- Educational framework with STEM integration

## Architecture

This project consists of:

- **Frontend**: React.js with SVG/Canvas for interactive design
- **Backend**: Node.js/Express for API services
- **Database**: MongoDB for design storage

## Development Roadmap

The project follows a 14-week MVP development plan:

1. Core Infrastructure & Architecture (Weeks 1-2)
2. Parametric Design Engine (Weeks 3-5)
3. Template Generation System (Weeks 6-8)
4. Physics & Simulation (Weeks 9-10)
5. User Interface & Experience (Weeks 11-12)
6. Testing, Refinement & Launch (Weeks 13-14)

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB
- Git

### Installation

1. Clone this repository
   ```
   git clone https://github.com/your-username/rubyrokit-design-system.git
   cd rubyrokit-design-system
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env
   ```

4. Start development server
   ```
   npm run dev
   ```

## Project Structure

```
rubyrokit-design-system/
├── frontend/           # React.js frontend application
├── backend/            # Node.js/Express backend API
├── shared/             # Shared code between frontend and backend
└── docs/               # Project documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built using modern web technologies
- Inspired by educational STEM initiatives
- Developed with assistance from AI tools including GitHub Copilot and Claude
