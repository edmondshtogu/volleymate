'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectPlayer, SelectSkillsSet } from '@/lib/db';
import { PlayerSkillsForm } from './player-skills-form';

type PlayerWithSkills = SelectPlayer & { skills: SelectSkillsSet | null };

const ratingMap: Record<string, string> = {
  '1': 'Beginner',
  '2': 'Novice',
  '3': 'Developing',
  '4': 'Competent',
  '5': 'Proficient',
  '6': 'Skilled',
  '7': 'Advanced',
  '8': 'Expert',
  '9': 'Master',
  '10': 'Elite'
};

export function PlayerDetails({
  player
}: {
  player: PlayerWithSkills;
}) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(player);

  const onSave = async (playerId: number, skills: SelectSkillsSet) => {
    const response = await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, skills })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error saving skills:', error.message);
      throw new Error(error.message);
    }
  };

  const handleSave = async (updatedSkills: SelectSkillsSet) => {
    await onSave(currentPlayer.id, updatedSkills);
    setCurrentPlayer({ ...currentPlayer, skills: updatedSkills });
    setIsEditing(false);
  };

  const skillCategories = [
    {
      title: 'Serving Skills',
      skills: ['servingConsistency', 'servingPower', 'servingAccuracy']
    },
    {
      title: 'Passing Skills',
      skills: ['passingControl', 'passingPositioning', 'passingFirstContact']
    },
    {
      title: 'Setting Skills',
      skills: ['settingAccuracy', 'settingDecisionMaking', 'settingConsistency']
    },
    {
      title: 'Hitting/Spiking Skills',
      skills: [
        'hittingSpikingPower',
        'hittingSpikingPlacement',
        'hittingSpikingTiming'
      ]
    },
    {
      title: 'Blocking Skills',
      skills: [
        'blockingTiming',
        'blockingPositioning',
        'blockingReadingAttacks'
      ]
    },
    {
      title: 'Defense/Digging Skills',
      skills: ['defenseReactionTime', 'defenseFootwork', 'defenseBallControl']
    },
    {
      title: 'Team Play Skills',
      skills: [
        'teamPlayCommunication',
        'teamPlayPositionalAwareness',
        'teamPlayAdaptability'
      ]
    },
    {
      title: 'Athleticism Skills',
      skills: [
        'athleticismSpeedAgility',
        'athleticismVerticalJump',
        'athleticismStamina'
      ]
    }
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{currentPlayer.name}</CardTitle>
        <Button hidden={user?.sub !== currentPlayer.userId} onClick={() => setIsEditing(!isEditing)}>
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
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.skills.map((skill) => (
                      <li key={skill} className="flex justify-between">
                        <span className="capitalize">
                          {skill.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span>
                          {currentPlayer.skills &&
                          currentPlayer.skills[skill as keyof SelectSkillsSet]
                            ? `${ratingMap[currentPlayer.skills[skill as keyof SelectSkillsSet]]} (${currentPlayer.skills[skill as keyof SelectSkillsSet]})`
                            : 'N/A'}
                        </span>
                      </li>
                    ))}
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
