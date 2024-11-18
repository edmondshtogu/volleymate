'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Player } from '@/lib/models';
import { PlayerSkillsForm } from './player-skills-form';

const ratingMap: Record<string, string> = {
  '1': 'Beginner',
  '2': 'Developing',
  '3': 'Competent',
  '4': 'Proficient',
  '5': 'Skilled'
};

export function PlayerDetails({ player }: { player: Player }) {
  const pathname = usePathname();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(player);

  const onSave = async (player: Player) => {
    const response = await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error saving skills:', error.message);
      throw new Error(error.message);
    }
  };

  const handleSave = async (updatedPlayer: Player) => {
    await onSave(updatedPlayer);
    setCurrentPlayer(updatedPlayer);
    setIsEditing(false);
  };

  const skillCategories = [
    { title: 'Serving Skills', skill: 'serving' },
    { title: 'Passing Skills', skill: 'passing' },
    { title: 'Blocking Skills', skill: 'blocking' },
    { title: 'Hitting/Spiking Skills', skill: 'hittingSpiking' },
    { title: 'Defense/Digging Skills', skill: 'defenseDigging' },
    { title: 'Athleticism Skills', skill: 'athleticism' }
  ] as const;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{currentPlayer.name}</CardTitle>
        <Button
          disabled={pathname !== '/settings'}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Skills'}
        </Button>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <PlayerSkillsForm
            player={currentPlayer}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
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
                        {
                          // Convert the numeric skill value to the rating label
                          ratingMap[
                            currentPlayer[
                              category.skill as keyof Player
                            ].toString()
                          ]
                        }
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
