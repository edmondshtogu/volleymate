'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Player, UserContext } from '@/lib/models';
import { PlayerSkillsForm } from './player-skills-form';
import { editSkills } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const ratingMap: Record<string, string> = {
  '1': 'Beginner',
  '2': 'Developing',
  '3': 'Competent',
  '4': 'Proficient',
  '5': 'Skilled'
};

export function PlayerDetails({
  player,
  userContext,
  event
}: {
  player: Player;
  userContext: UserContext;
  event: any;
}) {
  const pathname = usePathname();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(player);

  const handleSave = async (updatedPlayer: Player) => {
    await editSkills(updatedPlayer);
    setCurrentPlayer(updatedPlayer);
    setIsEditing(false);
  };

  const skillCategories = [
    { title: 'Serving Skills', graph: 'Serve', skill: 'serving' },
    { title: 'Passing Skills', graph: 'Pass', skill: 'passing' },
    { title: 'Blocking Skills', graph: 'Block', skill: 'blocking' },
    {
      title: 'Hitting/Spiking Skills',
      graph: 'Hit/Spike',
      skill: 'hittingSpiking'
    },
    {
      title: 'Defense/Digging Skills',
      graph: 'Defense/Digg',
      skill: 'defenseDigging'
    },
    { title: 'Athleticism Skills', graph: 'Athleticism', skill: 'athleticism' }
  ] as const;

  const chartData = skillCategories.map((category) => ({
    subject: category.graph,
    A: currentPlayer[category.skill as keyof Player],
    fullMark: 5
  }));

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{currentPlayer.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Player <strong>#{currentPlayer.id}</strong>
          </p>
        </div>
        {(pathname === '/settings' || userContext?.isAdmin) && (
          <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit Skills'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!currentPlayer.configured && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Configured</AlertTitle>
            <AlertDescription>
              Skills have not been fully configured. Please edit the skills to
              complete the configuration.
            </AlertDescription>
          </Alert>
        )}
        {isEditing ? (
          <PlayerSkillsForm
            player={currentPlayer}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            event={event}
          />
        ) : (
          <>
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={chartData}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} />
                  <Radar
                    name="Player"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skillCategories.map((category) => (
                <Card key={category.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <u>{category.title}</u>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li key={category.skill} className="flex justify-between">
                        <span className="capitalize">
                          <b>
                            {category.skill.replace(/([A-Z])/g, ' $1').trim()}
                          </b>
                        </span>
                        <span>
                          {ratingMap[
                            currentPlayer[
                              category.skill as keyof Player
                            ]?.toString() || '0'
                          ] || 'Not set'}
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
