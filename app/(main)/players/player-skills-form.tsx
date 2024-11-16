'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SelectPlayer, SelectSkillsSet } from '@/lib/db';

type PlayerWithSkills = SelectPlayer & { skills: SelectSkillsSet | null };

const ratingMap: Record<SelectSkillsSet[keyof SelectSkillsSet], string> = {
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

type SkillKey = keyof Omit<SelectSkillsSet, 'id' | 'playerId'>;

export function PlayerSkillsForm({
  player,
  onSave,
  onCancel
}: {
  player: PlayerWithSkills;
  onSave: (skills: SelectSkillsSet) => void;
  onCancel: () => void;
}) {
  const [skills, setSkills] = useState<SelectSkillsSet>(
    player.skills || ({} as SelectSkillsSet)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(skills);
  };

  const handleSkillChange = (
    skill: SkillKey,
    value: SelectSkillsSet[SkillKey]
  ) => {
    setSkills((prevSkills) => ({
      ...prevSkills,
      [skill]: value
    }));
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
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {skillCategories.map((category) => (
        <Card key={category.title}>
          <CardHeader>
            <CardTitle className="text-lg">{category.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category.skills.map((skill) => (
                <div key={skill}>
                  <label
                    htmlFor={skill}
                    className="block text-sm font-medium text-gray-700 capitalize mb-1"
                  >
                    {skill.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <Select
                    value={skills[skill as SkillKey] || '1'}
                    onValueChange={(value) =>
                      handleSkillChange(
                        skill as SkillKey,
                        value as SelectSkillsSet[SkillKey]
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.keys(ratingMap) as Array<keyof typeof ratingMap>
                      ).map((value) => (
                        <SelectItem key={value} value={value.toString()}>
                          {ratingMap[value]} ({value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
