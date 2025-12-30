// Burası hangi sayfaya hangi parametrelerin gideceğini belirlediğimiz yer.
// undefined: Parametre almıyor demek.
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined; // Ana ekran (Tab yapısı)
  Detail: { coinId: string }; // Detay sayfasına mutlaka coinId gitmeli!
};

export type RootTabParamList = {
  Home: undefined;
  Favorites: undefined;
};