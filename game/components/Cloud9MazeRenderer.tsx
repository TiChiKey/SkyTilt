// Cloud9 Maze Renderer - White background with vivid blue walls
import React from 'react';
import {
  Circle,
  Path,
  Skia,
  Shadow,
  Group,
  RadialGradient,
  vec,
} from '@shopify/react-native-skia';
import { MultiMarbleLevel, ArcWall, LineWall, Vector2D, ColoredGoal } from '../types';
import { PHYSICS } from '../constants';
import { CLOUD9_COLORS, GOAL_COLORS, MARBLE_COLORS } from '../constants/cloud9';

interface Cloud9MazeRendererProps {
  level: MultiMarbleLevel;
  size: number;
  scale: number;
  center: Vector2D;
}

export function Cloud9MazeRenderer({
  level,
  size,
  scale,
  center,
}: Cloud9MazeRendererProps) {
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
    const outerStartX = c.x + Math.cos(startAngle) * outerR;
    const outerStartY = c.y + Math.sin(startAngle) * outerR;
    const outerEndX = c.x + Math.cos(endAngle) * outerR;
    const outerEndY = c.y + Math.sin(endAngle) * outerR;

    const innerStartX = c.x + Math.cos(startAngle) * innerR;
    const innerStartY = c.y + Math.sin(startAngle) * innerR;
    const innerEndX = c.x + Math.cos(endAngle) * innerR;
    const innerEndY = c.y + Math.sin(endAngle) * innerR;

    const angleDiff = endAngle - startAngle;
    const largeArc = Math.abs(angleDiff) > Math.PI ? 1 : 0;

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

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = (-dy / len) * (thickness / 2);
    const ny = (dx / len) * (thickness / 2);

    return `M ${start.x + nx} ${start.y + ny}
            L ${end.x + nx} ${end.y + ny}
            L ${end.x - nx} ${end.y - ny}
            L ${start.x - nx} ${start.y - ny} Z`;
  };

  return (
    <Group>
      {/* White background floor */}
      <Circle
        cx={center.x}
        cy={center.y}
        r={level.mazeRadius * scale}
        color={CLOUD9_COLORS.background}
      />

      {/* Subtle radial gradient for depth */}
      <Circle cx={center.x} cy={center.y} r={level.mazeRadius * scale}>
        <RadialGradient
          c={vec(center.x, center.y)}
          r={level.mazeRadius * scale}
          colors={[
            CLOUD9_COLORS.background,
            CLOUD9_COLORS.backgroundSecondary,
            '#F0F4F8',
          ]}
          positions={[0, 0.8, 1]}
        />
      </Circle>

      {/* Blue boundary ring */}
      <Circle
        cx={center.x}
        cy={center.y}
        r={level.mazeRadius * scale}
        style="stroke"
        strokeWidth={6}
        color={CLOUD9_COLORS.primary}
      />

      {/* Render walls with Cloud9 blue */}
      {level.walls.map((wall, index) => {
        if (wall.type === 'arc') {
          const arcData = wall.data as ArcWall;
          const pathStr = createArcPath(arcData);
          return (
            <Group key={`wall-${index}`}>
              <Path path={pathStr} color={CLOUD9_COLORS.primary}>
                <Shadow
                  dx={2}
                  dy={2}
                  blur={6}
                  color="rgba(0, 100, 200, 0.3)"
                />
              </Path>
              {/* Wall highlight edge */}
              <Path
                path={pathStr}
                color={CLOUD9_COLORS.primaryLight}
                style="stroke"
                strokeWidth={1.5}
              />
            </Group>
          );
        } else {
          const lineData = wall.data as LineWall;
          const pathStr = createLinePath(lineData);
          return (
            <Group key={`wall-${index}`}>
              <Path path={pathStr} color={CLOUD9_COLORS.primary}>
                <Shadow
                  dx={2}
                  dy={2}
                  blur={6}
                  color="rgba(0, 100, 200, 0.3)"
                />
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
            {/* Pit warning glow */}
            <Circle cx={pos.x} cy={pos.y} r={r * 1.4}>
              <RadialGradient
                c={vec(pos.x, pos.y)}
                r={r * 1.4}
                colors={['rgba(255, 59, 48, 0.3)', 'transparent']}
              />
            </Circle>
            {/* Pit hole */}
            <Circle cx={pos.x} cy={pos.y} r={r}>
              <RadialGradient
                c={vec(pos.x, pos.y)}
                r={r}
                colors={['#1C1C1E', '#3A3A3C']}
              />
            </Circle>
            {/* Pit border */}
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={r}
              style="stroke"
              strokeWidth={2}
              color={CLOUD9_COLORS.error}
            />
          </Group>
        );
      })}

      {/* Checkpoints */}
      {level.checkpoints.map((checkpoint) => {
        const pos = transform(checkpoint.position);
        const r = checkpoint.radius * scale;
        return (
          <Group key={checkpoint.id}>
            <Circle cx={pos.x} cy={pos.y} r={r * 1.3}>
              <RadialGradient
                c={vec(pos.x, pos.y)}
                r={r * 1.3}
                colors={[
                  checkpoint.activated
                    ? 'rgba(52, 199, 89, 0.4)'
                    : 'rgba(0, 153, 255, 0.2)',
                  'transparent',
                ]}
              />
            </Circle>
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={r}
              color={
                checkpoint.activated
                  ? CLOUD9_COLORS.success
                  : CLOUD9_COLORS.primaryTranslucent
              }
            />
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={r}
              style="stroke"
              strokeWidth={2}
              color={
                checkpoint.activated
                  ? CLOUD9_COLORS.success
                  : CLOUD9_COLORS.primary
              }
            />
          </Group>
        );
      })}

      {/* Color-matched goals */}
      {level.goals.map((goal) => {
        const pos = transform(goal.position);
        const r = goal.radius * scale;
        const goalColors = GOAL_COLORS[goal.colorId];

        return (
          <Group key={goal.id}>
            {/* Goal glow */}
            <Circle cx={pos.x} cy={pos.y} r={r * 1.6}>
              <RadialGradient
                c={vec(pos.x, pos.y)}
                r={r * 1.6}
                colors={[goalColors.glow, 'transparent']}
              />
            </Circle>

            {/* Goal base */}
            <Circle cx={pos.x} cy={pos.y} r={r}>
              <RadialGradient
                c={vec(pos.x - r * 0.2, pos.y - r * 0.2)}
                r={r * 1.2}
                colors={[
                  MARBLE_COLORS[goal.colorId].light,
                  goalColors.main,
                  MARBLE_COLORS[goal.colorId].dark,
                ]}
                positions={[0, 0.5, 1]}
              />
            </Circle>

            {/* Goal ring */}
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={r}
              style="stroke"
              strokeWidth={3}
              color={goalColors.main}
            />

            {/* Inner indicator */}
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={r * 0.5}
              style="stroke"
              strokeWidth={2}
              color={CLOUD9_COLORS.white}
            />

            {/* Completion indicator */}
            {goal.isComplete && (
              <>
                <Circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r + 6}
                  style="stroke"
                  strokeWidth={4}
                  color={CLOUD9_COLORS.success}
                />
                <Circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r * 0.4}
                  color={CLOUD9_COLORS.white}
                />
              </>
            )}
          </Group>
        );
      })}

      {/* Start position indicators for each marble color */}
      {level.marbleSpawns.map((spawn) => {
        const pos = transform(spawn.position);
        const marbleColors = MARBLE_COLORS[spawn.colorId];
        return (
          <Group key={`spawn-${spawn.colorId}`}>
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={PHYSICS.marbleRadius * scale * 1.6}
              style="stroke"
              strokeWidth={2}
              color={marbleColors.main}
            />
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={PHYSICS.marbleRadius * scale * 1.3}
              style="stroke"
              strokeWidth={1}
              color={marbleColors.glow}
            />
          </Group>
        );
      })}
    </Group>
  );
}
