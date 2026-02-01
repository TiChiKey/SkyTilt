import React from 'react';
import {
  Canvas,
  Circle,
  Path,
  Skia,
  Shadow,
  LinearGradient,
  vec,
  Group,
  RadialGradient,
} from '@shopify/react-native-skia';
import { Level, ArcWall, LineWall, Vector2D } from '../types';
import { COLORS, PHYSICS } from '../constants';

interface MazeRendererProps {
  level: Level;
  size: number;
  scale: number;
  center: Vector2D;
}

export function MazeRenderer({ level, size, scale, center }: MazeRendererProps) {
  // Transform a point from level coordinates to screen coordinates
  const transform = (point: Vector2D): Vector2D => ({
    x: center.x + point.x * scale,
    y: center.y + point.y * scale,
  });

  // Create path for arc wall
  const createArcPath = (arc: ArcWall): string => {
    const c = transform(arc.center);
    const outerR = arc.outerRadius * scale;
    const innerR = arc.innerRadius * scale;
    const startAngle = arc.startAngle;
    const endAngle = arc.endAngle;

    // Create arc path
    const path = Skia.Path.Make();

    // Outer arc
    const outerStartX = c.x + Math.cos(startAngle) * outerR;
    const outerStartY = c.y + Math.sin(startAngle) * outerR;
    const outerEndX = c.x + Math.cos(endAngle) * outerR;
    const outerEndY = c.y + Math.sin(endAngle) * outerR;

    // Inner arc
    const innerStartX = c.x + Math.cos(startAngle) * innerR;
    const innerStartY = c.y + Math.sin(startAngle) * innerR;
    const innerEndX = c.x + Math.cos(endAngle) * innerR;
    const innerEndY = c.y + Math.sin(endAngle) * innerR;

    // Determine if it's a large arc
    const angleDiff = endAngle - startAngle;
    const largeArc = Math.abs(angleDiff) > Math.PI ? 1 : 0;

    // Build SVG path
    let d = `M ${outerStartX} ${outerStartY}`;
    d += ` A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}`;
    d += ` L ${innerEndX} ${innerEndY}`;
    d += ` A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}`;
    d += ' Z';

    return d;
  };

  // Create path for line wall
  const createLinePath = (line: LineWall): string => {
    const start = transform(line.start);
    const end = transform(line.end);
    const thickness = line.thickness * scale;

    // Calculate perpendicular direction
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = (-dy / len) * (thickness / 2);
    const ny = (dx / len) * (thickness / 2);

    // Create rectangle path
    return `M ${start.x + nx} ${start.y + ny}
            L ${end.x + nx} ${end.y + ny}
            L ${end.x - nx} ${end.y - ny}
            L ${start.x - nx} ${start.y - ny} Z`;
  };

  return (
    <Group>
      {/* Maze floor - radial gradient background */}
      <Circle
        cx={center.x}
        cy={center.y}
        r={level.mazeRadius * scale}
      >
        <RadialGradient
          c={vec(center.x, center.y)}
          r={level.mazeRadius * scale}
          colors={[COLORS.mazeFloorLight, COLORS.mazeFloor, COLORS.mazeWall]}
          positions={[0, 0.7, 1]}
        />
      </Circle>

      {/* Maze boundary ring */}
      <Circle
        cx={center.x}
        cy={center.y}
        r={level.mazeRadius * scale}
        style="stroke"
        strokeWidth={3}
        color={COLORS.skyBlueDark}
      />

      {/* Render walls */}
      {level.walls.map((wall, index) => {
        if (wall.type === 'arc') {
          const arcData = wall.data as ArcWall;
          const pathStr = createArcPath(arcData);
          return (
            <Group key={`wall-${index}`}>
              <Path
                path={pathStr}
                color={COLORS.mazeWall}
              >
                <Shadow dx={2} dy={2} blur={4} color="rgba(0,0,0,0.5)" />
              </Path>
              {/* Wall highlight */}
              <Path
                path={pathStr}
                color={COLORS.mazeWallHighlight}
                style="stroke"
                strokeWidth={1}
              />
            </Group>
          );
        } else {
          const lineData = wall.data as LineWall;
          const pathStr = createLinePath(lineData);
          return (
            <Group key={`wall-${index}`}>
              <Path
                path={pathStr}
                color={COLORS.mazeWall}
              >
                <Shadow dx={2} dy={2} blur={4} color="rgba(0,0,0,0.5)" />
              </Path>
            </Group>
          );
        }
      })}

      {/* Death pits */}
      {level.deathPits.map((pit) => {
        const pos = transform(pit.position);
        const r = pit.radius * scale;
        return (
          <Group key={pit.id}>
            {/* Pit glow */}
            <Circle cx={pos.x} cy={pos.y} r={r * 1.3}>
              <RadialGradient
                c={vec(pos.x, pos.y)}
                r={r * 1.3}
                colors={[COLORS.deathPitGlow, 'transparent']}
              />
            </Circle>
            {/* Pit hole */}
            <Circle cx={pos.x} cy={pos.y} r={r}>
              <RadialGradient
                c={vec(pos.x, pos.y)}
                r={r}
                colors={['#000000', COLORS.deathPit]}
              />
            </Circle>
          </Group>
        );
      })}

      {/* Checkpoints */}
      {level.checkpoints.map((checkpoint) => {
        const pos = transform(checkpoint.position);
        const r = checkpoint.radius * scale;
        return (
          <Group key={checkpoint.id}>
            {/* Checkpoint glow */}
            <Circle cx={pos.x} cy={pos.y} r={r * 1.4}>
              <RadialGradient
                c={vec(pos.x, pos.y)}
                r={r * 1.4}
                colors={[COLORS.checkpointGlow, 'transparent']}
              />
            </Circle>
            {/* Checkpoint pad */}
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={r}
              color={checkpoint.activated ? COLORS.checkpoint : COLORS.skyBlueTranslucent}
            />
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={r}
              style="stroke"
              strokeWidth={2}
              color={checkpoint.activated ? COLORS.checkpoint : COLORS.skyBlue}
            />
          </Group>
        );
      })}

      {/* Goal */}
      {(() => {
        const goalPos = transform(level.goal.position);
        const goalR = level.goal.radius * scale;
        return (
          <Group>
            {/* Goal glow */}
            <Circle cx={goalPos.x} cy={goalPos.y} r={goalR * 1.5}>
              <RadialGradient
                c={vec(goalPos.x, goalPos.y)}
                r={goalR * 1.5}
                colors={[COLORS.goalGlow, 'transparent']}
              />
            </Circle>
            {/* Goal circle */}
            <Circle cx={goalPos.x} cy={goalPos.y} r={goalR}>
              <RadialGradient
                c={vec(goalPos.x, goalPos.y - goalR * 0.3)}
                r={goalR}
                colors={[COLORS.gold, '#B8860B']}
              />
            </Circle>
            <Circle
              cx={goalPos.x}
              cy={goalPos.y}
              r={goalR}
              style="stroke"
              strokeWidth={2}
              color={COLORS.gold}
            />
          </Group>
        );
      })()}

      {/* Start position indicator */}
      {(() => {
        const startPos = transform(level.startPosition);
        return (
          <Circle
            cx={startPos.x}
            cy={startPos.y}
            r={PHYSICS.marbleRadius * scale * 1.5}
            style="stroke"
            strokeWidth={1}
            color={COLORS.skyBlueTranslucent}
          />
        );
      })()}
    </Group>
  );
}
