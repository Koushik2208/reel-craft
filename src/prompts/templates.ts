export type PromptTemplate = {
  id: string;
  category: string;
  label: string;
  description: string;
  template: string;
};

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "motivational",
    category: "Motivational",
    label: "Motivational / Inspirational",
    description: "Cinematic dark moody visuals that match the energy of motivational content",
    template: `You are a visual director for short-form social media videos. I will give you a script divided into scenes. For each scene, generate one image generation prompt that visually represents the emotion and message of that scene. Style: cinematic, dark moody, dramatic lighting, high contrast, photorealistic. Each prompt should be under 50 words and include: subject, setting, lighting, mood, and camera angle. Output as a numbered list matching the scene numbers.

My script:
[PASTE YOUR SCRIPT HERE]`,
  },
  {
    id: "personal",
    category: "Personal",
    label: "Personal / Storytelling",
    description: "Warm, intimate, film photography aesthetic for personal narratives",
    template: `You are a visual storyteller creating backgrounds for a personal narrative video. I will give you a script. For each scene generate one image prompt that feels intimate, authentic, and emotional. Style: warm tones, soft natural lighting, candid moments, film photography aesthetic, shallow depth of field. Each prompt under 50 words. Output as a numbered list.

My script:
[PASTE YOUR SCRIPT HERE]`,
  },
  {
    id: "political",
    category: "Political",
    label: "Political / Documentary",
    description: "Raw journalistic visuals, powerful and thought-provoking",
    template: `You are a documentary visual director. I will give you a script. For each scene generate one image prompt that feels journalistic, powerful, and thought-provoking. Style: documentary photography, harsh natural light, urban environments, crowd scenes, black and white or desaturated, raw and unfiltered. Each prompt under 50 words. Output as a numbered list.

My script:
[PASTE YOUR SCRIPT HERE]`,
  },
  {
    id: "cinematic",
    category: "Cinematic",
    label: "Cinematic / Dark",
    description: "Movie-still quality backgrounds with anamorphic cinematic grading",
    template: `You are a cinematographer for a cinematic short film. I will give you a script. For each scene generate one image prompt for a background that feels like a movie still. Style: anamorphic lens, dramatic shadows, neon or practical lighting, atmospheric fog, ultra wide or close-up, color graded (teal and orange or blue and gold). Each prompt under 50 words. Output numbered list.

My script:
[PASTE YOUR SCRIPT HERE]`,
  },
  {
    id: "nature",
    category: "Nature",
    label: "Nature / Aerial",
    description: "Vast landscapes and aerial photography connecting message to nature",
    template: `You are a nature documentary director. I will give you a script. For each scene generate one image prompt that connects the message to a powerful natural scene. Style: aerial photography, golden hour or blue hour light, vast landscapes, macro nature details, National Geographic quality, photorealistic. Each prompt under 50 words. Output as a numbered list.

My script:
[PASTE YOUR SCRIPT HERE]`,
  },
  {
    id: "abstract",
    category: "Abstract",
    label: "Abstract / Minimal",
    description: "Minimal art direction — feeling over literal meaning",
    template: `You are a minimalist art director for social media. I will give you a script. For each scene generate one abstract or minimal image prompt that represents the feeling rather than the literal meaning. Style: abstract photography, geometric shapes, solid color gradients, negative space, luxury minimal aesthetic, studio lighting. Each prompt under 50 words. Output numbered list.

My script:
[PASTE YOUR SCRIPT HERE]`,
  },
  {
    id: "urban",
    category: "Urban",
    label: "Urban / Street",
    description: "City life, street photography, neon and gritty realism",
    template: `You are a street photography director. I will give you a script. For each scene generate one image prompt that places the message in an urban context. Style: street photography, city lights, rain reflections, crowded streets, architecture, neon signs, candid human moments, gritty realism. Each prompt under 50 words. Output as a numbered list.

My script:
[PASTE YOUR SCRIPT HERE]`,
  },
  {
    id: "telugu",
    category: "Cultural",
    label: "Telugu / Cultural",
    description: "South Indian aesthetics, Tollywood cinematic feel, vibrant and rich",
    template: `You are a visual director for Telugu social media content. I will give you a script in Telugu or English. For each scene generate one image prompt that reflects South Indian culture, landscapes, and aesthetics. Style: vibrant colors, traditional and modern blend, Hyderabad city life or Andhra landscapes, cinematic Tollywood feel, golden light. Each prompt under 50 words. Output as a numbered list.

My script:
[PASTE YOUR SCRIPT HERE]`,
  },
];
