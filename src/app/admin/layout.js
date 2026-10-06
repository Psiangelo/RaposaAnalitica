// O painel nunca entra no Google (o robots.txt também bloqueia /admin).
export const metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return children;
}
