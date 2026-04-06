import { ForwardRefRenderFunction, forwardRef } from 'react';
import { Leaf, Zap, Euro, ShieldCheck, MapPin, Calendar, User } from 'lucide-react';
import { DiagnosticResult, PredictResponse } from '@/lib/api';

interface PrintReportProps {
  diagnostic: DiagnosticResult;
  recommandations: any[];
  user: any;
  homeData: any;
}

const PrintReportBase: ForwardRefRenderFunction<HTMLDivElement, PrintReportProps> = ({ 
  diagnostic, recommandations, user, homeData 
}, ref) => {
  const totalSavings = recommandations.reduce((acc, r) => acc + r.economie_annuelle_euros, 0);
  const bestRec = recommandations.sort((a, b) => b.economie_annuelle_euros - a.economie_annuelle_euros)[0];

  return (
    <div ref={ref} className="print-only bg-white text-slate-900 p-12 max-w-[210mm] mx-auto min-h-[297mm] shadow-none">
      {/* Header / Brand */}
      <div className="flex justify-between items-center border-b-2 border-slate-900 pb-8 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">EcoPredict</h1>
            <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Expertise Énergétique Certifiée</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-slate-400">Rapport d'Audit #EP-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
          <p className="text-sm font-bold">{new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Cover Section */}
      <div className="mb-12">
        <h2 className="text-4xl font-black mb-4 leading-none">Diagnostic de Performance Énergétique</h2>
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200"><User size={16} /></div>
                <div><p className="text-[9px] text-slate-500 font-bold uppercase">Propriétaire</p><p className="text-sm font-bold">{user?.nom || 'Client EcoPredict'}</p></div>
            </div>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200"><MapPin size={16} /></div>
                <div><p className="text-[9px] text-slate-500 font-bold uppercase">Localisation</p><p className="text-sm font-bold">{homeData?.departement || '75'} - France</p></div>
            </div>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200"><Calendar size={16} /></div>
                <div><p className="text-[9px] text-slate-500 font-bold uppercase">Construction</p><p className="text-sm font-bold">{homeData?.annee_construction_dpe || '1980'}</p></div>
            </div>
        </div>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        <div className="border-2 border-slate-900 rounded-3xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={40} /></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Consommation</p>
            <h3 className="text-7xl font-black mb-1">{diagnostic.classe_dpe}</h3>
            <p className="font-bold text-lg">{Math.round(diagnostic.consommation_kwh_m2_an)} <span className="text-xs font-medium">kWh/m²/an</span></p>
        </div>
        <div className="border-2 border-slate-900 rounded-3xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Leaf size={40} /></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Impact Carbone</p>
            <h3 className="text-7xl font-black mb-1">{diagnostic.classe_ges}</h3>
            <p className="font-bold text-lg">{Math.round(diagnostic.emission_co2_kg_m2_an)} <span className="text-xs font-medium">kgCO₂/m²/an</span></p>
        </div>
      </div>

      {/* Analysis Details */}
      <div className="mb-12">
        <h4 className="text-lg font-black uppercase tracking-tight mb-6 border-b border-slate-200 pb-2">Analyse Financière</h4>
        <div className="grid grid-cols-2 gap-12">
            <div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Sur la base d'une surface de <strong>{homeData?.surface_habitable_logement} m²</strong>, votre facture énergétique annuelle est estimée à 
                    <span className="text-slate-900 font-bold"> {Math.round(diagnostic.cout_annuel_euros).toLocaleString('fr-FR')} €</span>.
                </p>
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-sm font-bold">
                    <ShieldCheck size={18} />
                    Potentiel d'économie : {Math.round(totalSavings).toLocaleString('fr-FR')} € / an
                </div>
            </div>
            <div className="bg-slate-900 text-white p-6 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Focus Priorité</p>
                {bestRec ? (
                    <>
                        <h5 className="text-lg font-bold mb-2">{bestRec.nom}</h5>
                        <p className="text-xs text-slate-300 mb-4">Investissement le plus stratégique pour un ROI rapide ({bestRec.roi_annees} ans).</p>
                        <div className="text-2xl font-black text-emerald-400">-{bestRec.economie_annuelle_euros} € <span className="text-xs font-normal text-white">/an</span></div>
                    </>
                ) : (
                    <p className="text-sm">Votre logement ne nécessite pas de travaux immédiats.</p>
                )}
            </div>
        </div>
      </div>

      {/* Recommendations Table */}
      <div>
        <h4 className="text-lg font-black uppercase tracking-tight mb-6 border-b border-slate-200 pb-2">Plan de Travaux Préconisé</h4>
        <table className="w-full">
            <thead>
                <tr className="text-[10px] font-black uppercase text-slate-400 text-left">
                    <th className="pb-4">Désignation des travaux</th>
                    <th className="pb-4 text-right">Gain Énergie</th>
                    <th className="pb-4 text-right">Économie / An</th>
                    <th className="pb-4 text-right">Investissement</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {recommandations.map((r, i) => (
                    <tr key={i} className="text-sm">
                        <td className="py-4 font-bold">{r.nom}</td>
                        <td className="py-4 text-right font-medium text-blue-600">-{Math.round(diagnostic.consommation_kwh_m2_an - r.nouvelle_conso_kwh_m2)} kW</td>
                        <td className="py-4 text-right font-bold text-emerald-600">{Math.round(r.economie_annuelle_euros)} €</td>
                        <td className="py-4 text-right font-black">{Math.round(r.cout_travaux_euros).toLocaleString('fr-FR')} €</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-auto pt-20">
        <div className="p-6 bg-slate-50 rounded-2xl text-[10px] text-slate-500 leading-relaxed italic">
            Ce document est une simulation basée sur les informations fournies par l'utilisateur et les algorithmes EcoPredict. 
            Il ne remplace en aucun cas un Diagnostic de Performance Énergétique (DPE) réalisé physiquement par un expert certifié. 
            Les prix et aides financières sont donnés à titre indicatif selon les moyennes nationales françaises de 2024.
        </div>
        <p className="text-center mt-6 text-[9px] font-bold text-slate-400">EcoPredict Audit Tool - Généré le {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export const PrintReport = forwardRef(PrintReportBase);
