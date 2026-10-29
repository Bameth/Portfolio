import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col justify-center gap-6 bg-bg px-(--section-x) font-mono text-d1">
      <p className="text-[13px]"><span className="text-pink">$</span> cat ./page-demandee</p>
      <h1 className="section-title text-t1">404<span className="text-mint">.</span></h1>
      <p className="text-sm">cat: ./page-demandee: aucun fichier ou dossier de ce type</p>
      <Link href="/" className="self-start rounded border border-l3 px-4 py-3 text-xs text-t1 hover:border-mint hover:text-mint">
        cd ~/portfolio ↵
      </Link>
    </main>
  );
}
