Attribute VB_Name = "DQ10DataEditMenu"
Option Explicit

Private Const MENU_SHEET_NAME As String = "DQ10データ編集メニュー"

Private Function RepositoryRootPath() As String
    Dim basePath As String
    basePath = ThisWorkbook.Path

    If Len(basePath) = 0 Then
        RepositoryRootPath = ""
        Exit Function
    End If

    If FolderExists(basePath & Application.PathSeparator & "data") Then
        RepositoryRootPath = basePath
        Exit Function
    End If

    If LCase$(Right$(basePath, 6)) = LCase$(Application.PathSeparator & "tools") Then
        Dim parentPath As String
        parentPath = Left$(basePath, Len(basePath) - 6)
        If FolderExists(parentPath & Application.PathSeparator & "data") Then
            RepositoryRootPath = parentPath
            Exit Function
        End If
    End If

    If FolderExists(basePath & Application.PathSeparator & ".." & Application.PathSeparator & "data") Then
        RepositoryRootPath = basePath & Application.PathSeparator & ".."
        Exit Function
    End If

    RepositoryRootPath = basePath
End Function

Private Function FolderExists(ByVal folderPath As String) As Boolean
    FolderExists = (Len(Dir$(folderPath, vbDirectory)) > 0)
End Function

Private Function FileExists(ByVal filePath As String) As Boolean
    FileExists = (Len(Dir$(filePath, vbNormal)) > 0)
End Function

Private Function CsvFullPath(ByVal relativePath As String) As String
    Dim rootPath As String
    rootPath = RepositoryRootPath()

    If Len(rootPath) = 0 Then
        CsvFullPath = relativePath
    Else
        CsvFullPath = rootPath & Application.PathSeparator & Replace(relativePath, "/", Application.PathSeparator)
    End If
End Function

Private Function FindOpenWorkbookByFullName(ByVal filePath As String) As Workbook
    Dim targetPath As String
    targetPath = LCase$(Replace(filePath, "/", Application.PathSeparator))

    Dim book As Workbook
    For Each book In Application.Workbooks
        If LCase$(Replace(book.FullName, "/", Application.PathSeparator)) = targetPath Then
            Set FindOpenWorkbookByFullName = book
            Exit Function
        End If
    Next book

    Set FindOpenWorkbookByFullName = Nothing
End Function

Private Sub ActivateWorkbook(ByVal book As Workbook)
    If book Is Nothing Then Exit Sub
    book.Activate
    If book.Windows.Count > 0 Then book.Windows(1).Activate
End Sub

Private Sub OpenUtf8Csv(ByVal relativePath As String, ByVal displayName As String)
    Dim filePath As String
    filePath = CsvFullPath(relativePath)

    If Not FileExists(filePath) Then
        MsgBox displayName & " が見つかりません。" & vbCrLf & vbCrLf & filePath, vbExclamation, "CSVを開けません"
        Exit Sub
    End If

    Dim openedBook As Workbook
    Set openedBook = FindOpenWorkbookByFullName(filePath)
    If Not openedBook Is Nothing Then
        ActivateWorkbook openedBook
        Exit Sub
    End If

    Application.ScreenUpdating = False
    Workbooks.OpenText _
        Filename:=filePath, _
        Origin:=65001, _
        DataType:=xlDelimited, _
        TextQualifier:=xlTextQualifierDoubleQuote, _
        ConsecutiveDelimiter:=False, _
        Tab:=False, _
        Semicolon:=False, _
        Comma:=True, _
        Space:=False, _
        Other:=False, _
        Local:=True
    Application.ScreenUpdating = True
End Sub

Public Sub SetupDQ10DataEditMenu()
    Dim sheet As Worksheet
    On Error Resume Next
    Set sheet = ThisWorkbook.Worksheets(MENU_SHEET_NAME)
    On Error GoTo 0

    If sheet Is Nothing Then
        Set sheet = ThisWorkbook.Worksheets.Add(Before:=ThisWorkbook.Worksheets(1))
        sheet.Name = MENU_SHEET_NAME
    End If

    sheet.Cells.Clear
    DeleteMenuButtons sheet

    sheet.Range("A1").Value = "DQ10データ編集メニュー"
    sheet.Range("A2").Value = "編集したいCSVを選んで開きます。CSVはUTF-8として開き、既に開いている場合はそのブックを前面表示します。"
    sheet.Range("A4").Value = "CSV"
    sheet.Range("B4").Value = "用途"
    sheet.Range("C4").Value = "操作"

    sheet.Range("A1").Font.Bold = True
    sheet.Range("A1").Font.Size = 18
    sheet.Range("A2").WrapText = True
    sheet.Range("A4:C4").Font.Bold = True

    AddMenuRow sheet, 5, "data/recipe.csv", "レシピ・必要素材", "OpenRecipeCsv"
    AddMenuRow sheet, 6, "data/monster_detail_data.csv", "モンスター詳細", "OpenMonsterDetailCsv"
    AddMenuRow sheet, 7, "data/white_box.csv", "白宝箱", "OpenWhiteBoxCsv"
    AddMenuRow sheet, 8, "data/equipment_data.csv", "装備情報", "OpenEquipmentCsv"
    AddMenuRow sheet, 9, "data/orb_data.csv", "宝珠情報", "OpenOrbCsv"
    AddMenuRow sheet, 10, "data/bazaar_prices.csv", "バザー価格", "OpenBazaarPricesCsv"
    AddMenuRow sheet, 11, "data/present_codes.csv", "プレゼントのじゅもん", "OpenPresentCodesCsv"
    AddMenuRow sheet, 12, "data/field_farming_monsters.csv", "フィールド狩り", "OpenFieldFarmingCsv"
    AddMenuRow sheet, 13, "data/routine_tasks.csv", "日課・週課・月課", "OpenRoutineTasksCsv"

    sheet.Columns("A:A").ColumnWidth = 34
    sheet.Columns("B:B").ColumnWidth = 24
    sheet.Columns("C:C").ColumnWidth = 18
    sheet.Rows("2:2").RowHeight = 34
    sheet.Range("A1:C13").VerticalAlignment = xlCenter
    sheet.Activate
End Sub

Private Sub DeleteMenuButtons(ByVal sheet As Worksheet)
    Dim shape As Shape
    For Each shape In sheet.Shapes
        If Left$(shape.Name, 15) = "DQ10CsvButton_" Then shape.Delete
    Next shape
End Sub

Private Sub AddMenuRow(ByVal sheet As Worksheet, ByVal rowIndex As Long, ByVal relativePath As String, ByVal description As String, ByVal macroName As String)
    sheet.Cells(rowIndex, 1).Value = relativePath
    sheet.Cells(rowIndex, 2).Value = description

    Dim targetCell As Range
    Set targetCell = sheet.Cells(rowIndex, 3)

    Dim button As Shape
    Set button = sheet.Shapes.AddShape(msoShapeRoundedRectangle, targetCell.Left + 2, targetCell.Top + 2, targetCell.Width - 4, targetCell.Height - 4)
    button.Name = "DQ10CsvButton_" & CStr(rowIndex)
    button.TextFrame2.TextRange.Text = "開く"
    button.TextFrame2.TextRange.Font.Size = 10
    button.TextFrame2.TextRange.Font.Bold = msoTrue
    button.TextFrame2.VerticalAnchor = msoAnchorMiddle
    button.TextFrame2.TextRange.ParagraphFormat.Alignment = msoAlignCenter
    button.Fill.ForeColor.RGB = RGB(234, 213, 183)
    button.Line.ForeColor.RGB = RGB(183, 144, 104)
    button.OnAction = "'" & ThisWorkbook.Name & "'!" & macroName
End Sub

Public Sub OpenRecipeCsv()
    OpenUtf8Csv "data/recipe.csv", "recipe.csv"
End Sub

Public Sub OpenMonsterDetailCsv()
    OpenUtf8Csv "data/monster_detail_data.csv", "monster_detail_data.csv"
End Sub

Public Sub OpenWhiteBoxCsv()
    OpenUtf8Csv "data/white_box.csv", "white_box.csv"
End Sub

Public Sub OpenEquipmentCsv()
    OpenUtf8Csv "data/equipment_data.csv", "equipment_data.csv"
End Sub

Public Sub OpenOrbCsv()
    OpenUtf8Csv "data/orb_data.csv", "orb_data.csv"
End Sub

Public Sub OpenBazaarPricesCsv()
    OpenUtf8Csv "data/bazaar_prices.csv", "bazaar_prices.csv"
End Sub

Public Sub OpenPresentCodesCsv()
    OpenUtf8Csv "data/present_codes.csv", "present_codes.csv"
End Sub

Public Sub OpenFieldFarmingCsv()
    OpenUtf8Csv "data/field_farming_monsters.csv", "field_farming_monsters.csv"
End Sub

Public Sub OpenRoutineTasksCsv()
    OpenUtf8Csv "data/routine_tasks.csv", "routine_tasks.csv"
End Sub
