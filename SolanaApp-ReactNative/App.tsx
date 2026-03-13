import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { WalletButton } from "./src/components/WalletButton";
import { AnalysisPanel } from "./src/components/AnalysisPanel";
import { RecentAnalyses } from "./src/components/RecentPredictions";
import { UserStats } from "./src/components/UserStats";
import { NotificationBanner } from "./src/components/NotificationBanner";
import { DarkModeToggle } from "./src/components/DarkModeToggle";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView}>
        <NotificationBanner />
        
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoSection}>
              <Text style={styles.logoText}>MarketWizard</Text>
              <Text style={styles.tagline}>AI-Powered Market Analysis</Text>
            </View>
            <View style={styles.headerActions}>
              <DarkModeToggle />
              <WalletButton />
            </View>
          </View>
        </View>

        <View style={styles.main}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Analyze Markets with AI</Text>
            <Text style={styles.heroDescription}>
              Leverage advanced AI analysis to get informed market insights. Connect your wallet to track your analysis history.
            </Text>
          </View>

          <UserStats />
          <AnalysisPanel />
          <RecentAnalyses />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Built for Solana • Powered by AI</Text>
            <Text style={styles.footerSubtext}>Always do your own research before trading.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'column',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  tagline: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  main: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
