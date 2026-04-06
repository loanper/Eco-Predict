import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticResult } from '@/lib/api';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 15,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  brandSubtitle: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  reportRef: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0f172a',
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 15,
  },
  infoItem: {
    width: '30%',
  },
  infoLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  scoresGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  scoreBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0f172a',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  scoreUnit: {
    fontSize: 10,
    color: '#0f172a',
  },
  scoreSubUnit: {
    fontSize: 8,
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
    marginBottom: 10,
  },
  financialGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  financialTextContainer: {
    flex: 1,
  },
  financialText: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.5,
    marginBottom: 10,
  },
  savingsBanner: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#d1fae5',
    borderRadius: 6,
    padding: 8,
  },
  savingsBannerText: {
    fontSize: 10,
    color: '#065f46',
    fontWeight: 'bold',
  },
  topPriorityBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
  },
  priorityLabel: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  priorityName: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priorityDesc: {
    fontSize: 8,
    color: '#cbd5e1',
    lineHeight: 1.4,
    marginBottom: 8,
  },
  priorityValue: {
    fontSize: 16,
    color: '#34d399',
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 6,
    marginBottom: 6,
  },
  thName: { flex: 2, fontSize: 8, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' },
  thNum: { flex: 1, fontSize: 8, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'right' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tdName: { flex: 2, fontSize: 9, color: '#0f172a', fontWeight: 'bold' },
  tdGain: { flex: 1, fontSize: 9, color: '#2563eb', textAlign: 'right' },
  tdSave: { flex: 1, fontSize: 9, color: '#059669', textAlign: 'right', fontWeight: 'bold' },
  tdCost: { flex: 1, fontSize: 9, color: '#0f172a', textAlign: 'right', fontWeight: 'bold' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
  },
  disclaimerBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  disclaimerText: {
    fontSize: 7,
    color: '#64748b',
    lineHeight: 1.4,
  },
  footerBrand: {
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: 'bold',
  }
});

interface ReportPDFProps {
  diagnostic: DiagnosticResult;
  recommandations: any[];
  user: any;
  homeData: Record<string, any>;
}

export const ReportPDF = ({ diagnostic, recommandations, user, homeData }: ReportPDFProps) => {
  const totalSavings = recommandations.reduce((acc, r: any) => acc + r.economie_annuelle_euros, 0);
  const sortedRecs = [...recommandations].sort((a, b) => b.economie_annuelle_euros - a.economie_annuelle_euros);
  const bestRec = sortedRecs.length > 0 ? sortedRecs[0] : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>ECOPREDICT</Text>
            <Text style={styles.brandSubtitle}>Expertise Énergétique Certifiée</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.reportRef}>Rapport d'Audit #{Math.random().toString(36).substr(2, 6).toUpperCase()}</Text>
            <Text style={styles.reportDate}>{new Date().toLocaleDateString('fr-FR')}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.heroTitle}>Diagnostic de Performance Énergétique</Text>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Propriétaire</Text>
            <Text style={styles.infoValue}>{user?.nom || 'Client EcoPredict'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Localisation</Text>
            <Text style={styles.infoValue}>{homeData?.code_departement || homeData?.departement || '75'} - France</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Construction</Text>
            <Text style={styles.infoValue}>{homeData?.annee_construction_dpe || '1980'}</Text>
          </View>
        </View>

        {/* Scores */}
        <View style={styles.scoresGrid}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Consommation</Text>
            <Text style={styles.scoreValue}>{diagnostic.classe_dpe}</Text>
            <Text style={styles.scoreUnit}>{Math.round(diagnostic.consommation_kwh_m2_an)} <Text style={styles.scoreSubUnit}>kWh/m²/an</Text></Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Impact Carbone</Text>
            <Text style={styles.scoreValue}>{diagnostic.classe_ges}</Text>
            <Text style={styles.scoreUnit}>{Math.round(diagnostic.emission_co2_kg_m2_an)} <Text style={styles.scoreSubUnit}>kgCO2/m²/an</Text></Text>
          </View>
        </View>

        {/* Financial */}
        <Text style={styles.sectionTitle}>Analyse Financière</Text>
        <View style={styles.financialGrid}>
          <View style={styles.financialTextContainer}>
            <Text style={styles.financialText}>
              Sur la base d'une surface de {homeData?.surface_habitable_logement || 'N/A'} m2, votre facture énergétique annuelle est estimée à {Math.round(diagnostic.cout_annuel_euros).toLocaleString('fr-FR')} EUR.
            </Text>
            <View style={styles.savingsBanner}>
              <Text style={styles.savingsBannerText}>
                Potentiel d'économie : {Math.round(totalSavings).toLocaleString('fr-FR')} EUR / an
              </Text>
            </View>
          </View>
          <View style={styles.topPriorityBox}>
            <Text style={styles.priorityLabel}>Focus Priorité</Text>
            {bestRec ? (
              <>
                <Text style={styles.priorityName}>{bestRec.nom}</Text>
                <Text style={styles.priorityDesc}>Investissement le plus stratégique pour un ROI rapide ({bestRec.roi_annees} ans).</Text>
                <Text style={styles.priorityValue}>-{bestRec.economie_annuelle_euros} EUR / an</Text>
              </>
            ) : (
              <Text style={styles.priorityDesc}>Votre logement ne nécessite pas de travaux immédiats.</Text>
            )}
          </View>
        </View>

        {/* Table */}
        <Text style={styles.sectionTitle}>Plan de Travaux Préconisé</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.thName}>Désignation des travaux</Text>
            <Text style={styles.thNum}>Gain Énergie</Text>
            <Text style={styles.thNum}>Économie/An</Text>
            <Text style={styles.thNum}>Investissement</Text>
          </View>
          {recommandations.map((r: any, i: number) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.tdName}>{r.nom}</Text>
              <Text style={styles.tdGain}>-{Math.round(diagnostic.consommation_kwh_m2_an - r.nouvelle_conso_kwh_m2)} kW</Text>
              <Text style={styles.tdSave}>{Math.round(r.economie_annuelle_euros)} EUR</Text>
              <Text style={styles.tdCost}>{Math.round(r.cout_travaux_euros).toLocaleString('fr-FR')} EUR</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              Ce document est une simulation basee sur les informations fournies par l'utilisateur et les algorithmes EcoPredict. Il ne remplace en aucun cas un Diagnostic de Performance Energetique (DPE) realise physiquement par un expert certifie.
            </Text>
          </View>
          <Text style={styles.footerBrand}>EcoPredict Audit Tool - Genere le {new Date().toLocaleString()}</Text>
        </View>

      </Page>
    </Document>
  );
};
