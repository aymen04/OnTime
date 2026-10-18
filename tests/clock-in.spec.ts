import { test, expect } from '@playwright/test';
import { addDays, format } from 'date-fns';

// Remplace ces valeurs par tes vraies données de base de données locale
const ORG_SLUG = 'aymen-factory'; // Le slug de ton organisation
const MANAGER_EMAIL = 'aymenpsn5@gmail.com';
const MANAGER_PASS = 'Winners-2005';
const EMPLOYEE_EMAIL = 'aymenadline5@gmail.com';
const EMPLOYEE_PASS = 'Winners-2005';

test.describe('Flux complet A à Z : Création de Shift et Pointage Sécurisé', () => {
  
  test('Le manager crée un shift, l\'employé voyage dans le temps pour le pointer', async ({ browser }) => {
    
    // ---------------------------------------------------------
    // ÉTAPE 1 : LE MANAGER CRÉE LE SHIFT POUR DEMAIN
    // ---------------------------------------------------------
    
    // On crée une session propre pour le manager
    const managerContext = await browser.newContext();
    const managerPage = await managerContext.newPage();

    console.log("👨‍💼 Connexion du Manager...");
    await managerPage.goto('http://localhost:3000/auth/sign-in');
    await managerPage.fill('input[name="email"]', MANAGER_EMAIL);
    await managerPage.fill('input[name="password"]', MANAGER_PASS);
    await managerPage.click('button[type="submit"]');
    await managerPage.waitForURL(`**/organizations/${ORG_SLUG}/**`);

    console.log("👨‍💼 Création du shift pour demain...");
    await managerPage.goto(`http://localhost:3000/organizations/${ORG_SLUG}/schedule`);

    // Calcul de la date de demain pour que le test fonctionne tous les jours
    const tomorrow = addDays(new Date(), 1);
    const tomorrowDateString = format(tomorrow, 'yyyy-MM-dd'); // ex: "2026-10-25"

    // Remplissage du formulaire de création (basé sur ton composant CreateShiftForm)
    // On sélectionne le premier employé de la liste (index 1 car index 0 est le placeholder "-- Sélectionner --")
    await managerPage.locator('select[name="employeeId"]').selectOption({ index: 1 });
    await managerPage.fill('input[type="date"]', tomorrowDateString);
    await managerPage.fill('input[name="startTime"]', '15:00');
    await managerPage.fill('input[name="endTime"]', '23:00');
    
    // Clic sur le bouton de création et attente de la réinitialisation du formulaire
    await managerPage.click('button[type="submit"]:has-text("Planifier")');
    // On attend que le champ date se vide (preuve que le formulaire a été soumis avec succès)
    await expect(managerPage.locator('input[type="date"]')).toHaveValue('');
    
    await managerContext.close(); // Le manager a fini son travail


    // ---------------------------------------------------------
    // ÉTAPE 2 : L'EMPLOYÉ VOYAGE DANS LE TEMPS
    // ---------------------------------------------------------
    
    // On crée une nouvelle session isolée pour l'employé
    const employeeContext = await browser.newContext();
    const employeePage = await employeeContext.newPage();

    // 🕒 MAGIE : On fige l'horloge de cet employé à DEMAIN 12:00:00 (3h avant le shift)
    // On force le fuseau horaire de Montréal pour coller à tes tests
    const fakeTimeTooEarly = new Date(`${tomorrowDateString}T12:00:00-04:00`);
    await employeePage.clock.install({ time: fakeTimeTooEarly });

    console.log("👷 Connexion de l'employé à 12h00 (Bloqué)...");
    await employeePage.goto('http://localhost:3000/login');
    await employeePage.fill('input[name="email"]', EMPLOYEE_EMAIL);
    await employeePage.fill('input[name="password"]', EMPLOYEE_PASS);
    await employeePage.click('button[type="submit"]');
    
    // On va sur le dashboard
    await employeePage.waitForURL(`**/organizations/${ORG_SLUG}/home`);

    // Vérification de la sécurité : Le bouton doit être GRIS et DÉSACTIVÉ
    const disabledBtn = employeePage.getByRole('button', { name: /Disponible 30 min avant/i });
    await expect(disabledBtn).toBeVisible();
    await expect(disabledBtn).toBeDisabled();


    // ---------------------------------------------------------
    // ÉTAPE 3 : AVANCEMENT DU TEMPS À 14h45
    // ---------------------------------------------------------
    
    console.log("⏱️ L'employé attend jusqu'à 14h45 (Débloqué)...");
    
    // 🕒 On avance l'horloge de l'ordinateur virtuel de l'employé (15 min avant le shift)
    const fakeTimeReady = new Date(`${tomorrowDateString}T14:45:00-04:00`);
    await employeePage.clock.setFixedTime(fakeTimeReady);

    // On rafraîchit la page pour simuler l'employé qui sort son téléphone de sa poche
    await employeePage.reload();

    // Vérification finale : Le bouton doit être VERT et CLIQUABLE
    const clockInBtn = employeePage.getByRole('button', { name: /Pointer mon arrivée/i });
    await expect(clockInBtn).toBeVisible();
    await expect(clockInBtn).toBeEnabled();

    // Optionnel : On peut même le faire cliquer pour tester la Server Action GPS !
    // await clockInBtn.click();
    // await expect(employeePage.getByText('Enregistrement...')).toBeVisible();

    await employeeContext.close();
  });

});