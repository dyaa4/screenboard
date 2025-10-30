interface UserProfileDto {
  sub: string; // Eindeutige ID für den Nutzer
  name: string; // Vollständiger Name des Nutzers
  given_name: string; // Vorname des Nutzers
  family_name: string; // Nachname des Nutzers
  picture: string; // URL zu einem Profilbild des Nutzers
  email?: string; // E-Mail-Adresse des Nutzers (optional, wenn der Nutzer zugestimmt hat)
  email_verified?: boolean; // Gibt an, ob die E-Mail-Adresse verifiziert ist (optional)
  locale: string; // Spracheinstellung des Nutzers
}
