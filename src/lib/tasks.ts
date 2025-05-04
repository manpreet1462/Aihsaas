// lib/tasks.ts
export const tasks = [
    {
      id: 'brushing-teeth',
      title: 'Brushing Teeth',
      description: 'Step-by-step teeth brushing guide',
      category: 'hygiene',
      difficulty: 'medium',
      steps: [
        {
          id: 'step-1',
          instruction: 'Pick up your toothbrush',
          visualPrompt: 'Hold toothbrush in hand',
          audioPrompt: 'Please pick up your toothbrush',
          successCriteria: 'Toothbrush is in hand',
          defaultRepetition: 15 // seconds
        },
        {
          id: 'step-2',
          instruction: 'Apply toothpaste to brush',
          visualPrompt: 'Toothpaste on bristles',
          audioPrompt: 'Put a small amount of toothpaste on your brush',
          successCriteria: 'Toothpaste is on brush',
          defaultRepetition: 15
        },
        {
          id: 'step-3',
          instruction: 'Brush top teeth (30 seconds)',
          visualPrompt: 'Brushing top teeth',
          audioPrompt: 'Now brush your top teeth',
          successCriteria: 'Top teeth brushed',
          defaultRepetition: 30
        },
        {
          id: 'step-4',
          instruction: 'Brush top teeth (30 seconds)',
          visualPrompt: 'Brushing top teeth',
          audioPrompt: 'Now brush your top teeth',
          successCriteria: 'Top teeth brushed',
          defaultRepetition: 30
        },
        {
          id: 'step-5',
          instruction: 'Brush bottom teeth (30 seconds)',
          visualPrompt: 'Brushing bottom teeth',
          audioPrompt: 'Now brush your bottom teeth',
          successCriteria: 'Bottom teeth brushed',
          defaultRepetition: 30
        },
        {
          id: 'step-6',
          instruction: 'Rinse your mouth with water',
          visualPrompt: 'Child rinsing mouth',
          audioPrompt: 'Finally, rinse your mouth with water',
          successCriteria: 'Mouth is rinsed',
          defaultRepetition: 20
        }
      ]
    }
  ];