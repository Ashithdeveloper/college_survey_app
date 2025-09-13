import 'package:flutter/material.dart';

class LoginSelectionPage extends StatefulWidget {
  const LoginSelectionPage({super.key});

  @override
  State<LoginSelectionPage> createState() => _LoginSelectionPageState();
}

class _LoginSelectionPageState extends State<LoginSelectionPage> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  void _onPageChanged(int index) {
    setState(() {
      _currentPage = index;
    });
  }

  void _nextPage() {
    if (_currentPage < 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    }
  }

  void _previousPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 30),
            const Text(
              "Choose Your Access Type",
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              "Different portals for students and educational institutions",
              style: TextStyle(fontSize: 16, color: Colors.black54),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),

            // PageView for carousel
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: _onPageChanged,
                children: [
                  _buildCard(
                    context,
                    icon: Icons.school,
                    title: "Student Portal",
                    description:
                    "Access surveys from your institution with secure ID verification",
                    points: const [
                      "ID card verification required",
                      "Access to institution-specific surveys",
                      "Secure student information protection",
                    ],
                    buttonText: "Login as Student",
                    buttonColor: Colors.blue,
                    onTap: () {
                      // Navigate to student login
                    },
                  ),
                  _buildCard(
                    context,
                    icon: Icons.apartment,
                    title: "Institution Portal",
                    description:
                    "Manage surveys and access detailed analytics and reports",
                    points: const [
                      "Comprehensive survey management",
                      "Detailed analytics and reports",
                      "Multi-institution support",
                    ],
                    buttonText: "Login as Institution",
                    buttonColor: Colors.teal,
                    onTap: () {
                      // Navigate to institution login
                    },
                  ),
                ],
              ),
            ),

            // Indicators + Buttons
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Prev Button
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios),
                    onPressed: _previousPage,
                    color: _currentPage == 0 ? Colors.grey : Colors.black,
                  ),

                  // Dots
                  Row(
                    children: List.generate(
                      2,
                          (index) => Container(
                        margin: const EdgeInsets.symmetric(horizontal: 6),
                        width: _currentPage == index ? 12 : 8,
                        height: _currentPage == index ? 12 : 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _currentPage == index
                              ? Colors.blue
                              : Colors.grey[400],
                        ),
                      ),
                    ),
                  ),

                  // Next Button
                  IconButton(
                    icon: const Icon(Icons.arrow_forward_ios),
                    onPressed: _nextPage,
                    color: _currentPage == 1 ? Colors.grey : Colors.black,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(
      BuildContext context, {
        required IconData icon,
        required String title,
        required String description,
        required List<String> points,
        required String buttonText,
        required Color buttonColor,
        required VoidCallback onTap,
      }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 6,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: buttonColor.withOpacity(0.15),
              child: Icon(icon, color: buttonColor, size: 28),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              description,
              style: const TextStyle(fontSize: 14, color: Colors.black54),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: points
                  .map((point) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.circle,
                        size: 6, color: buttonColor.withOpacity(0.8)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        point,
                        style: const TextStyle(fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ))
                  .toList(),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: buttonColor,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: onTap,
                child: Text(
                  buttonText,
                  style: const TextStyle(fontSize: 14, color: Colors.white),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
