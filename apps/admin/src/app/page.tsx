import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@repo/ui";

const MOCK_ITEMS = [
  {
    id: "1",
    title: "Mountain Landscape",
    description: "Beautiful snowy peaks with a clear blue sky",
    prompt: "majestic mountain peaks covered in snow, cinematic lighting, 4k",
  },
  {
    id: "2",
    title: "Neon City",
    description: "Cyberpunk style city streets with neon signs",
    prompt: "cyberpunk city streets at night, neon lights, rainy reflection, highly detailed",
  },
  {
    id: "3",
    title: "Mystic Forest",
    description: "Ancient trees with glowing mushrooms and fog",
    prompt: "enchanted forest with bioluminescent plants and mystical fog, ethereal vibe",
  },
  {
    id: "4",
    title: "Future Robot",
    description: "Sleek humanoid robot in a high-tech laboratory",
    prompt: "advanced humanoid robot, futuristic tech, white clean laboratory, macro photography",
  },
  {
    id: "5",
    title: "Deep Sea Creature",
    description: "Glowing jellyfish-like creature in the dark ocean",
    prompt: "bioluminescent deep sea creature, dark ocean floor, vibrant colors, alien-like",
  },
  {
    id: "6",
    title: "Space Colony",
    description: "Human habitat inside a giant space station ring",
    prompt: "space station interior habitat, orbital colony, green gardens in space, science fiction",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 dark:bg-black sm:p-24">
      <main className="w-full max-w-6xl">
        <header className="mb-12 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-white sm:text-5xl">
            Generative Gallery
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Click on any item to view details. Images are generated via AI.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_ITEMS.map((item) => (
            <Link href={`/${item.id}`} key={item.id} className="group transition-transform hover:scale-[1.02]">
              <Card className="h-full overflow-hidden border-zinc-200 dark:border-zinc-800">
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(item.prompt)}?width=600&height=400&nologo=true&seed=${item.id}`}
                    alt={item.title}
                    fill
                    className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                    unoptimized
                  />
                </div>
                <CardHeader className="p-4 pb-2">
                  <h2 className="text-xl font-bold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {item.title}
                  </h2>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
