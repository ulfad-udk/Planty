import PlantIdentifier from "./components/PlantIdentifier";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-green-100 to-green-200">
      <h1 className="text-4xl font-bold mb-8 text-green-800">
Planty
      </h1>
      <PlantIdentifier />
    </main>
  );
}
